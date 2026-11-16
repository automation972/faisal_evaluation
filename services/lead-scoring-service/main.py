"""
Y10 CRM — Lead Scoring Service
===============================================================================
A standalone **FastAPI** (Python) backend microservice.

Purpose:
    Scores incoming leads so the Young10 Marketing sales team can prioritize
    follow-ups. The CRM stores every lead in PostgreSQL; this service exposes
    a deterministic scoring model that grades a lead 0-100 and classifies it
    as HOT / WARM / COLD based on:

      * Lead source quality (referrals outperform cold calls)
      * Estimated deal value
      * Contactability (email + phone present)
      * Firmographics (company / job title present)
      * Context richness (notes provided, named contact)

Endpoints:
    POST /score          — score a single lead
    POST /score/batch    — score many leads (e.g. nightly re-scoring)
    GET  /health         — liveness probe

Run:
    pip install -r requirements.txt
    uvicorn main:app --host 0.0.0.0 --port 4060
===============================================================================
"""

from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(
    title="Y10 Lead Scoring Service",
    description="FastAPI microservice that scores Young10 Marketing leads (0-100, HOT/WARM/COLD).",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# Constants — scoring model
# ---------------------------------------------------------------------------

SOURCE_WEIGHTS = {
    "REFERRAL": 25,
    "PAID_ADS": 18,
    "WEBSITE": 15,
    "EVENT": 15,
    "EMAIL_CAMPAIGN": 12,
    "SOCIAL_MEDIA": 10,
    "COLD_CALL": 8,
    "OTHER": 5,
}

VALUE_MAX_POINTS = 30.0
VALUE_REFERENCE = 15_000.0  # deals at/above this value earn the full 30 points

EMAIL_POINTS = 10
PHONE_POINTS = 8
FIRMOGRAPHY_POINTS = 9  # company or job title present
NOTES_POINTS = 3

TIER_HOT_THRESHOLD = 70
TIER_WARM_THRESHOLD = 45

# ---------------------------------------------------------------------------
# Schemas (pydantic models = FastAPI request/response contracts)
# ---------------------------------------------------------------------------


class LeadIn(BaseModel):
    """Lead payload — mirrors the CRM lead contract."""

    firstName: str = Field(min_length=1, max_length=80)
    lastName: str = Field(min_length=1, max_length=80)
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    jobTitle: Optional[str] = None
    source: str = "WEBSITE"
    value: float = Field(default=0.0, ge=0)
    notes: Optional[str] = None


class BatchIn(BaseModel):
    leads: List[LeadIn] = Field(min_length=1, max_length=500)


class ScoreBreakdown(BaseModel):
    source: int
    value: int
    contactability: int
    firmography: int
    context: int


class ScoreOut(BaseModel):
    firstName: str
    lastName: str
    score: int
    tier: str
    breakdown: ScoreBreakdown
    recommendation: str


class BatchOut(BaseModel):
    scored: int
    hot: int
    warm: int
    cold: int
    results: List[ScoreOut]


# ---------------------------------------------------------------------------
# Scoring engine
# ---------------------------------------------------------------------------


def _clamp(value: float, low: int = 0, high: int = 100) -> float:
    return max(low, min(high, value))


def score_lead(lead: LeadIn) -> ScoreOut:
    """Compute the 0-100 score, tier and factor breakdown for one lead."""
    source_key = str(lead.source or "OTHER").upper()
    source_points = SOURCE_WEIGHTS.get(source_key, SOURCE_WEIGHTS["OTHER"])

    value_points = round(_clamp((lead.value or 0.0) / VALUE_REFERENCE) * VALUE_MAX_POINTS, 1)

    contactability = 0
    if lead.email:
        contactability += EMAIL_POINTS
    if lead.phone:
        contactability += PHONE_POINTS

    firmography = 0
    if lead.company:
        firmography += 6
    if lead.jobTitle:
        firmography += 3

    context = 0
    if lead.notes and len(lead.notes.strip()) >= 20:
        context += NOTES_POINTS

    total = _clamp(source_points + value_points + contactability + firmography + context)

    if total >= TIER_HOT_THRESHOLD:
        tier = "HOT"
        recommendation = "Reach out within 1 hour — assign to the top rep and schedule a call today."
    elif total >= TIER_WARM_THRESHOLD:
        tier = "WARM"
        recommendation = "Follow up within 24 hours with a personalized email sequence."
    else:
        tier = "COLD"
        recommendation = "Add to the nurture campaign; re-engage when intent signals appear."

    return ScoreOut(
        firstName=lead.firstName,
        lastName=lead.lastName,
        score=int(round(total)),
        tier=tier,
        breakdown=ScoreBreakdown(
            source=int(source_points),
            value=int(value_points),
            contactability=contactability,
            firmography=firmography,
            context=context,
        ),
        recommendation=recommendation,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
def health() -> dict:
    """Liveness probe."""
    return {
        "service": "y10-lead-scoring",
        "framework": "FastAPI",
        "status": "ok",
    }


@app.post("/score", response_model=ScoreOut)
def score(lead: LeadIn) -> ScoreOut:
    """Score a single lead (0-100 + HOT/WARM/COLD tier + factor breakdown)."""
    try:
        return score_lead(lead)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Scoring failed: {exc}") from exc


@app.post("/score/batch", response_model=BatchOut)
def score_batch(batch: BatchIn) -> BatchOut:
    """Score up to 500 leads at once — ideal for nightly re-scoring jobs."""
    results = [score_lead(lead) for lead in batch.leads]
    return BatchOut(
        scored=len(results),
        hot=sum(1 for r in results if r.tier == "HOT"),
        warm=sum(1 for r in results if r.tier == "WARM"),
        cold=sum(1 for r in results if r.tier == "COLD"),
        results=results,
    )
