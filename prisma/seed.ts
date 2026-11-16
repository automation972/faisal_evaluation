// Young10 Marketing CRM - database seed
// Run: DATABASE_URL="postgresql://..." bunx prisma db seed  (or: bun prisma/seed-run.ts)

import { PrismaClient, LeadStage, LeadSource, TaskPriority, TaskStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const REPS = [
  { name: 'Sarah Mitchell', email: 'sarah@young10marketing.com' },
  { name: 'Mike Thompson', email: 'mike@young10marketing.com' },
  { name: 'Emma Rodriguez', email: 'emma@young10marketing.com' },
];

const LEAD_POOL: Array<{
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  stage: LeadStage;
  source: LeadSource;
  value: number;
  daysAgo: number;
  notes: string;
}> = [
  { firstName: 'James', lastName: 'Carter', company: 'Helena Coffee Roasters', jobTitle: 'Owner', stage: 'NEW', source: 'WEBSITE', value: 1500, daysAgo: 1, notes: 'Filled contact form asking about local SEO for two locations.' },
  { firstName: 'Olivia', lastName: 'Bennett', company: 'Big Sky Dental', jobTitle: 'Practice Manager', stage: 'NEW', source: 'PAID_ADS', value: 3200, daysAgo: 2, notes: 'Google Ads campaign - wants more patient bookings.' },
  { firstName: 'Noah', lastName: 'Parker', company: 'Montana Trail Gear', jobTitle: 'Founder', stage: 'NEW', source: 'SOCIAL_MEDIA', value: 4800, daysAgo: 3, notes: 'Instagram DM converted to inquiry. Interested in ecommerce marketing.' },
  { firstName: 'Ava', lastName: 'Sandoval', company: 'Queen City Bakery', jobTitle: 'Co-Owner', stage: 'CONTACTED', source: 'REFERRAL', value: 1200, daysAgo: 5, notes: 'Referred by Big Sky Dental. Called once, follow up next week.' },
  { firstName: 'Liam', lastName: 'Nguyen', company: 'Powell Plumbing Co.', jobTitle: 'GM', stage: 'CONTACTED', source: 'COLD_CALL', value: 2600, daysAgo: 6, notes: 'Cold call went well. Sent service one-pager.' },
  { firstName: 'Sophia', lastName: 'Turner', company: 'Last Chance Boutiques', jobTitle: 'Owner', stage: 'CONTACTED', source: 'EMAIL_CAMPAIGN', value: 1900, daysAgo: 7, notes: 'Opened pricing email twice. Interested in social media package.' },
  { firstName: 'Ethan', lastName: 'Wallace', company: 'Gate City Fitness', jobTitle: 'Director', stage: 'QUALIFIED', source: 'PAID_ADS', value: 5400, daysAgo: 9, notes: 'Budget confirmed. Wants PPC + landing page redesign.' },
  { firstName: 'Mia', lastName: 'Foster', company: 'Rimrock Law Group', jobTitle: 'Partner', stage: 'QUALIFIED', source: 'REFERRAL', value: 7200, daysAgo: 11, notes: 'Needs local SEO for three practice areas. Decision maker engaged.' },
  { firstName: 'Lucas', lastName: 'Reyes', company: 'Steel Elix Coffee', jobTitle: 'Founder', stage: 'QUALIFIED', source: 'EVENT', value: 3600, daysAgo: 12, notes: 'Met at Helena chamber mixer. Wants brand refresh.' },
  { firstName: 'Harper', lastName: 'Cole', company: 'Yellowstone RV Rentals', jobTitle: 'Owner', stage: 'PROPOSAL', source: 'WEBSITE', value: 8900, daysAgo: 16, notes: 'Proposal sent - seasonal SEO + Google Maps optimization.' },
  { firstName: 'Ella', lastName: 'Morgan', company: 'Copper Village Realty', jobTitle: 'Broker', stage: 'PROPOSAL', source: 'REFERRAL', value: 6800, daysAgo: 18, notes: 'Proposal for agent spotlight pages + paid ads. Negotiating scope.' },
  { firstName: 'Benjamin', lastName: 'Hayes', company: 'Prairie Wind Auto', jobTitle: 'Dealer Principal', stage: 'PROPOSAL', source: 'COLD_CALL', value: 11500, daysAgo: 20, notes: 'Full-funnel package proposed. Comparing with another agency.' },
  { firstName: 'Grace', lastName: 'Whitman', company: 'Alpine Physical Therapy', jobTitle: 'Clinic Director', stage: 'WON', source: 'WEBSITE', value: 4200, daysAgo: 26, notes: 'Signed 6-month local SEO retainer. Kickoff scheduled.' },
  { firstName: 'Henry', lastName: 'Delgado', company: 'Flathead Outfitters', jobTitle: 'Owner', stage: 'WON', source: 'SOCIAL_MEDIA', value: 5600, daysAgo: 33, notes: 'Signed for content + email automation. Very happy with audit.' },
  { firstName: 'Layla', lastName: 'Brooks', company: 'Granite County Bank', jobTitle: 'VP Marketing', stage: 'WON', source: 'EMAIL_CAMPAIGN', value: 14000, daysAgo: 41, notes: 'Annual contract signed - SEO + content writing.' },
  { firstName: 'Owen', lastName: 'Fischer', company: 'Bitterroot Bike Co.', jobTitle: 'Owner', stage: 'NEW', source: 'OTHER', value: 2200, daysAgo: 0, notes: 'Walk-in inquiry. Wants ecommerce site audit.' },
  { firstName: 'Zoe', lastName: 'Anders', company: 'Helena Pizza Works', jobTitle: 'Owner', stage: 'CONTACTED', source: 'WEBSITE', value: 900, daysAgo: 4, notes: 'Interested in Google Maps optimization only.' },
  { firstName: 'Caleb', lastName: 'Jennings', company: 'Missoula Med Spa', jobTitle: 'Manager', stage: 'QUALIFIED', source: 'PAID_ADS', value: 6100, daysAgo: 10, notes: 'Wants lead-gen landing pages + follow-up automation.' },
  { firstName: 'Nora', lastName: 'Patel', company: 'Summit Pediatric Care', jobTitle: 'Administrator', stage: 'PROPOSAL', source: 'REFERRAL', value: 7500, daysAgo: 14, notes: 'Proposal includes review management + local SEO.' },
  { firstName: 'Isaac', lastName: 'Moreau', company: 'Treasure State Titles', jobTitle: 'COO', stage: 'WON', source: 'REFERRAL', value: 9800, daysAgo: 48, notes: 'Renewed for second year. Great case study candidate.' },
];

const TASK_POOL: Array<{
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  leadIdx: number;
  dueInDays: number; // negative = overdue
}> = [
  { title: 'Send SEO audit for Helena Coffee Roasters', description: 'Run site crawl, summarize top 5 fixes and quick wins.', priority: 'HIGH', status: 'PENDING', leadIdx: 0, dueInDays: 1 },
  { title: 'Follow up on pricing email - Last Chance Boutiques', description: 'Answer questions about the social media package tiers.', priority: 'MEDIUM', status: 'PENDING', leadIdx: 5, dueInDays: 2 },
  { title: 'Prepare PPC proposal draft - Gate City Fitness', description: 'Keyword plan + budget split across two campaigns.', priority: 'HIGH', status: 'IN_PROGRESS', leadIdx: 6, dueInDays: 3 },
  { title: 'Call Rimrock Law Group about content plan', description: 'Discuss blog cadence and practice-area keywords.', priority: 'MEDIUM', status: 'PENDING', leadIdx: 7, dueInDays: 0 },
  { title: 'Send contract - Alpine Physical Therapy', description: 'Finalize 6-month retainer paperwork.', priority: 'HIGH', status: 'IN_PROGRESS', leadIdx: 12, dueInDays: -1 },
  { title: 'Kickoff call prep - Flathead Outfitters', description: 'Assemble onboarding checklist and access request list.', priority: 'MEDIUM', status: 'PENDING', leadIdx: 13, dueInDays: 4 },
  { title: 'Renewal meeting - Treasure State Titles', description: 'Present year-one results and upsell AI automation services.', priority: 'LOW', status: 'COMPLETED', leadIdx: 19, dueInDays: -6 },
  { title: 'Fix tracking on Yellowstone RV proposal link', description: 'UTM parameters missing on the sent proposal.', priority: 'LOW', status: 'COMPLETED', leadIdx: 9, dueInDays: -3 },
  { title: 'Research competitor ads - Missoula Med Spa', description: 'Screenshot top 5 competitor landing pages for the deck.', priority: 'MEDIUM', status: 'PENDING', leadIdx: 17, dueInDays: 5 },
  { title: 'Collect Google review links - Summit Pediatric Care', description: 'Needed for the review management rollout in proposal.', priority: 'HIGH', status: 'PENDING', leadIdx: 18, dueInDays: -2 },
];

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(17, 0, 0, 0);
  return d;
}

function daysAgo(days: number, jitterHours = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10 + (jitterHours % 6), (jitterHours * 7) % 60, 0, 0);
  return d;
}

async function main() {
  console.log('Seeding Young10 Marketing CRM...');

  await db.activity.deleteMany();
  await db.task.deleteMany();
  await db.apiKey.deleteMany();
  await db.lead.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const repHash = await bcrypt.hash('Sales@123', 10);

  const admin = await db.user.create({
    data: { name: 'Alex Carter', email: 'admin@young10marketing.com', passwordHash, role: 'ADMIN', active: true },
  });
  console.log('  admin created:', admin.email);

  const reps = [];
  for (const rep of REPS) {
    reps.push(
      await db.user.create({
        data: { name: rep.name, email: rep.email, passwordHash: repHash, role: 'SALES_REP', active: true },
      }),
    );
    console.log('  rep created:', rep.email);
  }

  // Assign leads round-robin: seeded pipeline work is distributed across reps
  const assignees = [reps[0], reps[1], reps[2], null];
  const createdLeads = [];
  for (let i = 0; i < LEAD_POOL.length; i++) {
    const pool = LEAD_POOL[i];
    const assignee = pool.stage === 'NEW' ? assignees[i % 4] : reps[i % 3];
    const lead = await db.lead.create({
      data: {
        firstName: pool.firstName,
        lastName: pool.lastName,
        email: `${pool.firstName.toLowerCase()}.${pool.lastName.toLowerCase()}@${pool.company
          .toLowerCase()
          .replace(/[^a-z]+/g, '')
          .slice(0, 14)}.com`,
        phone: `+1 (406) ${200 + (i * 37) % 700}-${(1000 + (i * 613) % 9000).toString().slice(0, 4)}`,
        company: pool.company,
        jobTitle: pool.jobTitle,
        source: pool.source,
        stage: pool.stage,
        status: 'OPEN',
        value: pool.value,
        notes: pool.notes,
        lastContactedAt: pool.stage === 'NEW' ? null : daysAgo(pool.daysAgo, i),
        createdAt: daysAgo(pool.daysAgo, i),
        updatedAt: daysAgo(pool.daysAgo, i),
        assignedToId: assignee ? assignee.id : null,
        createdById: admin.id,
      },
    });
    createdLeads.push(lead);
  }
  console.log('  leads created:', createdLeads.length);

  for (const t of TASK_POOL) {
    const lead = createdLeads[t.leadIdx];
    const status = t.status;
    await db.task.create({
      data: {
        title: t.title,
        description: t.description,
        priority: t.priority,
        status,
        dueDate: daysFromNow(t.dueInDays),
        completedAt: status === 'COMPLETED' ? daysFromNow(t.dueInDays - 1) : null,
        leadId: lead.id,
        assignedToId: lead.assignedToId ?? admin.id,
        createdById: admin.id,
        createdAt: daysAgo(2),
      },
    });
  }
  console.log('  tasks created:', TASK_POOL.length);

  const { key, prefix } = { key: 'y10_seed_demo_key_8f2c41b9e7', prefix: 'y10_seed_d' };
  await db.apiKey.create({
    data: { name: 'Website contact form', key, prefix, createdById: admin.id, active: true },
  });
  console.log('  api key created:', prefix + '...');

  // Realistic activity trail
  const activities: Array<{ type: 'LEAD_CREATED' | 'STAGE_CHANGED' | 'LEAD_ASSIGNED' | 'TASK_CREATED' | 'TASK_COMPLETED' | 'EXTERNAL_LEAD' | 'LEAD_LOST'; message: string; userId?: string; leadId?: string; daysAgo: number }> = [
    { type: 'LEAD_CREATED', message: 'Created lead Owen Fischer at Bitterroot Bike Co.', userId: admin.id, leadId: createdLeads[15].id, daysAgo: 0 },
    { type: 'EXTERNAL_LEAD', message: 'New lead James Carter received via API key "Website contact form"', leadId: createdLeads[0].id, daysAgo: 1 },
    { type: 'LEAD_CREATED', message: 'Created lead Olivia Bennett at Big Sky Dental', userId: admin.id, leadId: createdLeads[1].id, daysAgo: 2 },
    { type: 'STAGE_CHANGED', message: 'Moved Benjamin Hayes from QUALIFIED to PROPOSAL', userId: reps[2].id, leadId: createdLeads[11].id, daysAgo: 3 },
    { type: 'TASK_COMPLETED', message: 'Completed task "Renewal meeting - Treasure State Titles"', userId: reps[1].id, leadId: createdLeads[19].id, daysAgo: 4 },
    { type: 'LEAD_ASSIGNED', message: 'Assigned Noah Parker to Mike Thompson', userId: admin.id, leadId: createdLeads[2].id, daysAgo: 3 },
    { type: 'STAGE_CHANGED', message: 'Moved Layla Brooks from PROPOSAL to WON', userId: reps[0].id, leadId: createdLeads[14].id, daysAgo: 5 },
    { type: 'LEAD_LOST', message: 'Marked a prospect as lost', userId: reps[2].id, daysAgo: 6 },
    { type: 'TASK_CREATED', message: 'Created task "Collect Google review links - Summit Pediatric Care"', userId: admin.id, leadId: createdLeads[18].id, daysAgo: 2 },
    { type: 'STAGE_CHANGED', message: 'Moved Grace Whitman from PROPOSAL to WON', userId: reps[1].id, leadId: createdLeads[12].id, daysAgo: 7 },
  ];

  for (const a of activities) {
    await db.activity.create({
      data: {
        type: a.type,
        message: a.message,
        userId: a.userId,
        leadId: a.leadId,
        createdAt: daysAgo(a.daysAgo),
      },
    });
  }
  console.log('  activities created:', activities.length);

  console.log('Seed complete.');
  console.log('  ADMIN  login: admin@young10marketing.com / Admin@123');
  console.log('  REP    login: sarah@young10marketing.com / Sales@123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
