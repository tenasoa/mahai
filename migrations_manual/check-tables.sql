-- Vérifier que les tables existent
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('User', 'PasswordReset', 'EmailVerification')
ORDER BY table_name, ordinal_position;
