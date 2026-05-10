-- ============================================================================
-- Ajout du provider OpenRouter (agrégateur de modèles gratuits)
-- Modèles gratuits disponibles (suffixe :free) — vérifier https://openrouter.ai/models?q=free :
--   z-ai/glm-4.5-air:free             — défaut recommandé
--   google/gemma-4-26b-a4b-it:free
--   nvidia/nemotron-3-super-120b-a12b:free — gros modèle raisonnement
--   nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
-- Clé API : https://openrouter.ai/settings/keys (compte gratuit suffisant)
-- ============================================================================

INSERT INTO "SystemSetting" (id, key, value, type, label, description, category, "isEditable", "updatedAt")
VALUES (
  gen_random_uuid(),
  'ai.openrouter.model',
  'z-ai/glm-4.5-air:free',
  'string',
  'Modèle OpenRouter',
  'Modèle OpenRouter utilisé pour les corrections IA. Les modèles gratuits portent le suffixe :free. Voir https://openrouter.ai/models?q=free pour la liste à jour.',
  'ai',
  true,
  NOW()
)
ON CONFLICT (key) DO UPDATE
  SET value = 'z-ai/glm-4.5-air:free',
      description = 'Modèle OpenRouter utilisé pour les corrections IA. Les modèles gratuits portent le suffixe :free. Voir https://openrouter.ai/models?q=free pour la liste à jour.',
      "updatedAt" = NOW();
