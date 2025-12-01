-- CreateTable
CREATE TABLE "SubmissionTestResult" (
    "id" SERIAL NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "caseNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "timeMs" INTEGER NOT NULL,
    "output" TEXT,
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubmissionTestResult_submissionId_idx" ON "SubmissionTestResult"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionTestResult_submissionId_caseNumber_key" ON "SubmissionTestResult"("submissionId", "caseNumber");

-- AddForeignKey
ALTER TABLE "SubmissionTestResult" ADD CONSTRAINT "SubmissionTestResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
