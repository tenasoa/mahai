-- Solution douce : créer l'enum puis modifier la colonne
CREATE TYPE "Role" AS ENUM ('ETUDIANT', 'CONTRIBUTEUR', 'PROFESSEUR', 'VERIFICATEUR', 'VALIDATEUR', 'ADMIN');

-- Modifier la colonne role pour utiliser le nouvel enum
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING 'ETUDIANT'::"Role";
