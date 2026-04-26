-- ============================================================================
-- Multi-provider IA — Claude / Perplexity (extensible OpenAI plus tard)
-- ----------------------------------------------------------------------------
-- Le provider actif est piloté par la SystemSetting `ai.provider`.
-- Chaque provider a sa propre clé `ai.<provider>.model` pour découpler les
-- noms de modèles. L'effort (`ai.effort`) reste partagé : Claude le respecte
-- via `output_config.effort`, Perplexity via le choix sonar-pro vs
-- sonar-reasoning-pro.
--
-- Les clés API restent dans .env.local (ANTHROPIC_API_KEY, PERPLEXITY_API_KEY)
-- — JAMAIS dans la DB.
-- ============================================================================

-- 1. Renomme l'ancien `ai.model` → `ai.claude.model` pour préserver la valeur
--    si elle a été personnalisée. Idempotent.
UPDATE "SystemSetting"
   SET key         = 'ai.claude.model',
       label       = 'Modèle Claude',
       description = 'Identifiant exact du modèle Anthropic (ex: claude-sonnet-4-6, claude-opus-4-7).'
 WHERE key = 'ai.model';

-- 2. Insère le toggle provider et le modèle Perplexity par défaut.
INSERT INTO "SystemSetting" (key, value, category, type, label, description)
VALUES
  ('ai.provider',          'claude', 'ai', 'string',
   'Provider IA actif',
   'claude | perplexity — détermine quel fournisseur est appelé pour les corrections IA.'),
  ('ai.perplexity.model',  'sonar-pro', 'ai', 'string',
   'Modèle Perplexity',
   'Identifiant Sonar (sonar, sonar-pro, sonar-reasoning, sonar-reasoning-pro).')
ON CONFLICT (key) DO NOTHING;

-- 3. Au cas où la migration AI précédente n'a pas été appliquée, on s'assure
--    que `ai.claude.model` existe bien (fallback safe).
INSERT INTO "SystemSetting" (key, value, category, type, label, description)
VALUES
  ('ai.claude.model',      'claude-sonnet-4-6', 'ai', 'string',
   'Modèle Claude',
   'Identifiant exact du modèle Anthropic (ex: claude-sonnet-4-6, claude-opus-4-7).')
ON CONFLICT (key) DO NOTHING;
