-- Migration : Ajout de la préférence d'opérateur de paiement
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "defaultOperator" TEXT DEFAULT 'MVOLA';
