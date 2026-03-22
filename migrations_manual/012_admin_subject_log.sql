-- Ajouter la table SubjectLog pour tracer l'historique de modération des sujets
CREATE TABLE IF NOT EXISTS "SubjectLog" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL, -- 'CREATED', 'UPDATED', 'PUBLISHED', 'REJECTED', 'DRAFTED'
    "oldStatus" TEXT,
    "newStatus" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectLog_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "SubjectLog" ADD CONSTRAINT "SubjectLog_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubjectLog" ADD CONSTRAINT "SubjectLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Index
CREATE INDEX IF NOT EXISTS "idx_subjectlog_subjectid" ON "SubjectLog"("subjectId");
