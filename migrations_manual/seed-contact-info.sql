-- =====================================================
-- MAH.AI - Seed Contact Info Settings
-- =====================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- pour initialiser les coordonnées de contact par défaut
-- =====================================================

-- Insérer les paramètres de contact par défaut
INSERT INTO "SystemSetting" (key, value, category, type, label, description)
VALUES
  ('contact_general_email', 'contact@mah.ai', 'contact', 'string', 'Email général', 'Email de contact principal'),
  ('contact_legal_email', 'legal@mah.ai', 'contact', 'string', 'Email juridique', 'Email pour les questions juridiques'),
  ('contact_phone', '+261 34 XX XXX XX', 'contact', 'string', 'Téléphone', 'Numéro de téléphone'),
  ('contact_address', 'Antananarivo 101, Madagascar', 'contact', 'string', 'Adresse', 'Adresse physique')
ON CONFLICT (key) DO NOTHING;

-- Vérifier l'insertion
SELECT key, value, category, label
FROM "SystemSetting"
WHERE category = 'contact'
ORDER BY key;
