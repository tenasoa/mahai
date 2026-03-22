-- Nettoyer toutes les données pour o.tenasoa@gmail.com
DELETE FROM "EmailVerification" WHERE email = 'o.tenasoa@gmail.com';
DELETE FROM "PasswordReset" WHERE email = 'o.tenasoa@gmail.com';
DELETE FROM "User" WHERE email = 'o.tenasoa@gmail.com';
