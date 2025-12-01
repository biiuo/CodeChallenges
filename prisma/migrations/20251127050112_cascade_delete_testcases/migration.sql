-- DropForeignKey
ALTER TABLE "Testcase" DROP CONSTRAINT "Testcase_challengeId_fkey";

-- AddForeignKey
ALTER TABLE "Testcase" ADD CONSTRAINT "Testcase_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
