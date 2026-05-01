-- ============================================================================
-- Ajout provider IA OpenAI
-- ----------------------------------------------------------------------------
-- Idempotent : peut être exécuté même si les migrations multi-provider
-- précédentes sont déjà appliquées.
-- ============================================================================

INSERT INTO "SystemSetting" (key, value, category, type, label, description)
VALUES
  ('ai.openai.model', 'gpt-5.4-mini', 'ai', 'string',
   'Modèle OpenAI',
   'Identifiant exact du modèle OpenAI utilisé via Responses API (ex: gpt-5.4-mini, gpt-5.4, gpt-5.5).')
ON CONFLICT (key) DO NOTHING;

UPDATE "SystemSetting"
   SET description = 'claude | perplexity | openai — détermine quel fournisseur est appelé pour les corrections IA.'
 WHERE key = 'ai.provider';
