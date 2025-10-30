import { Testcase } from "../entities/testcase.entity";

export interface TestCaseRepository {
  create(Testcase: Partial<Testcase>): Promise<Testcase>;
  findAllByChallengeId(challengeId: string): Promise<Testcase[]>;
  findByChallengeIdAndNumber(challengeId: string, caseNumber: number): Promise<Testcase | null>;
  update(data: Partial<Testcase>): Promise<Testcase>;
  delete(challengeId: string, caseNumber: number): Promise<void>;
}