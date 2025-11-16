-- Add sample conversations for SmartQ Demo Org only
-- Run this SQL script directly in your Supabase SQL editor if you want extra demo calls

INSERT INTO "Conversation" (
  id,
  "agentId",
  "organizationId",
  "customerPhone",
  "customerName",
  status,
  duration,
  sentiment,
  outcome,
  topic,
  "startedAt",
  "endedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM "VoiceAgent" WHERE "organizationId" = 'demo-org-id' LIMIT 1),
  'demo-org-id',
  '+447900' || lpad((random() * 1000000)::int::text, 6, '0'),
  (ARRAY['Sarah Johnson', 'Michael Brown', 'Emily White', 'David Miller', 'Lisa Anderson'])[floor(random() * 5 + 1)],
  (ARRAY['ENDED', 'CONNECTED', 'FAILED'])[floor(random() * 3 + 1)::int],
  (random() * 500 + 60)::int,
  (ARRAY['POSITIVE', 'NEUTRAL', 'NEGATIVE'])[floor(random() * 3 + 1)::int],
  (ARRAY['successful', 'unsuccessful', 'callback_requested'])[floor(random() * 3 + 1)],
  (ARRAY['Appointment booking', 'Prescription inquiry', 'Test results', 'General inquiry', 'Emergency'])[floor(random() * 5 + 1)],
  NOW() - (random() * interval '7 days'),
  NOW() - (random() * interval '6 days'),
  NOW() - (random() * interval '7 days'),
  NOW() - (random() * interval '7 days')
FROM generate_series(1, 20);

-- Sample conversations for HealthPlus Medical Services (demo-org-id)
INSERT INTO "Conversation" (
  id,
  "agentId",
  "organizationId",
  "customerPhone",
  "customerName",
  status,
  duration,
  sentiment,
  outcome,
  topic,
  "startedAt",
  "endedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM "VoiceAgent" WHERE "organizationId" = 'demo-org-id' LIMIT 1),
  'demo-org-id',
  '+447900' || lpad((random() * 1000000)::int::text, 6, '0'),
  (ARRAY['Sarah Johnson', 'Michael Brown', 'Emily White', 'David Miller', 'Lisa Anderson'])[floor(random() * 5 + 1)],
  (ARRAY['ENDED', 'CONNECTED', 'FAILED'])[floor(random() * 3 + 1)::int],
  (random() * 500 + 60)::int,
  (ARRAY['POSITIVE', 'NEUTRAL', 'NEGATIVE'])[floor(random() * 3 + 1)::int],
  (ARRAY['successful', 'unsuccessful', 'callback_requested'])[floor(random() * 3 + 1)],
  (ARRAY['Appointment booking', 'Prescription inquiry', 'Test results', 'General inquiry', 'Emergency'])[floor(random() * 5 + 1)],
  NOW() - (random() * interval '7 days'),
  NOW() - (random() * interval '6 days'),
  NOW() - (random() * interval '7 days'),
  NOW() - (random() * interval '7 days')
FROM generate_series(1, 20);

