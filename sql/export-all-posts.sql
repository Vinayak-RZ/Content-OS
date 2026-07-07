-- ============================================================================
-- Export ALL synced social posts (from Buffer / Publer sync) with full stats
-- ----------------------------------------------------------------------------
-- Database: PostgreSQL (Supabase)
-- Source tables: "SocialPost", "BufferChannel", "Draft", "User"
--
-- Metrics are stored as a JSONB array on "SocialPost".metrics, e.g.
--   [{"type":"impressions","name":"Impressions","value":1234,"unit":"count"}, ...]
-- This query flattens the known metric types into their own columns AND keeps
-- the raw JSON so nothing is lost.
--
-- HOW TO USE:
--   Replace the email in the WHERE clause with your account email.
--   (Or swap the whole predicate for:  sp."userId" = '<your-user-uuid>')
-- ============================================================================

WITH metric_values AS (
  -- Pivot the JSONB metrics array into one row per post with a column per metric
  SELECT
    sp.id AS social_post_id,
    MAX(CASE WHEN m->>'type' = 'impressions'     THEN (m->>'value')::numeric END) AS impressions,
    MAX(CASE WHEN m->>'type' = 'reach'           THEN (m->>'value')::numeric END) AS reach,
    MAX(CASE WHEN m->>'type' = 'reactions'       THEN (m->>'value')::numeric END) AS reactions,
    MAX(CASE WHEN m->>'type' = 'comments'        THEN (m->>'value')::numeric END) AS comments,
    MAX(CASE WHEN m->>'type' = 'reposts'         THEN (m->>'value')::numeric END) AS reposts,
    MAX(CASE WHEN m->>'type' = 'engagementRate'  THEN (m->>'value')::numeric END) AS engagement_rate
  FROM "SocialPost" sp
  CROSS JOIN LATERAL jsonb_array_elements(sp.metrics::jsonb) AS m
  GROUP BY sp.id
)
SELECT
  -- Identity
  sp.id                                   AS post_id,
  sp."bufferPostId"                       AS buffer_post_id,

  -- Channel / platform
  bc.service                              AS platform,          -- linkedin | twitter | ...
  COALESCE(bc."displayName", bc.name)     AS channel,

  -- Status & timing
  sp.status                               AS status,            -- sent | scheduled | ...
  sp."publishedAt"                        AS published_at,
  sp."scheduledAt"                        AS scheduled_at,

  -- Content
  sp.text                                 AS post_text,
  length(sp.text)                         AS text_length,

  -- Content OS linkage (if this post came from a Content OS draft)
  sp."draftId"                            AS draft_id,
  d."topicTitle"                          AS draft_title,
  d.pipeline                              AS draft_pipeline,
  sp."attributionMethod"                  AS attribution_method,
  sp."attributionConfidence"              AS attribution_confidence,

  -- Flattened metrics (NULL = network has not reported this metric)
  mv.impressions,
  mv.reach,
  mv.reactions,
  mv.comments,
  mv.reposts,
  mv.engagement_rate,
  (COALESCE(mv.reactions, 0) + COALESCE(mv.comments, 0) + COALESCE(mv.reposts, 0))
                                          AS total_interactions,

  -- Freshness
  sp."metricsUpdatedAt"                   AS metrics_updated_at,
  sp."lastSyncedAt"                       AS last_synced_at,
  sp."createdAt"                          AS created_at,

  -- Full raw metrics payload (nothing dropped)
  sp.metrics                              AS raw_metrics
FROM "SocialPost" sp
JOIN "BufferChannel" bc ON bc.id = sp."channelId"
LEFT JOIN "Draft" d      ON d.id = sp."draftId"
LEFT JOIN metric_values mv ON mv.social_post_id = sp.id
WHERE sp."userId" = (
  SELECT id FROM "User" WHERE email = 'YOUR_EMAIL_HERE'  -- <-- change this
)
ORDER BY sp."publishedAt" DESC NULLS LAST;
