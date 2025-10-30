import { Testcase } from "src/domain/entities/testcase.entity";
import { Testcase as PrismaTestcase } from "@prisma/client";

export class TestcaseMapper {
  static toDomain(prismaTestcase: PrismaTestcase): Testcase {
    return new Testcase(
      prismaTestcase.challengeId,
      prismaTestcase.caseNumber,
      prismaTestcase.input,
      prismaTestcase.output,
      prismaTestcase.visible,
    );
  }

  static toPrisma(domainTestcase: Testcase): Omit<PrismaTestcase, 'createdAt' | 'updatedAt'> {
    return {
      challengeId: domainTestcase.challengeId,
      caseNumber: domainTestcase.caseNumber,
      input: domainTestcase.input,
      output: domainTestcase.output,
      visible: domainTestcase.visible,
    } as PrismaTestcase;
  }
}
