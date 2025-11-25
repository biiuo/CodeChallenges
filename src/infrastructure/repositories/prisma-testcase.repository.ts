import { Injectable } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { TestCaseRepository } from '../../domain/repositories/testcase.repository';
import { Testcase } from '../../domain/entities/testcase.entity';

@Injectable()
export class PrismaTestcaseRepository implements TestCaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Testcase>): Promise<Testcase> {
    const testcase = await this.prisma.testcase.create({
      data: {
        challengeId: data.challengeId!,
        caseNumber: data.caseNumber!,
        input: data.input || '',
        output: data.output || '',
        visible: data.visible ?? false,
      },
    });
    return this.toDomain(testcase);
  }

  async findAllByChallengeId(challengeId: string): Promise<Testcase[]> {
    const testcases = await this.prisma.testcase.findMany({
      where: { challengeId },
      orderBy: { caseNumber: 'asc' },
    });
    return testcases.map((tc) => this.toDomain(tc));
  }

  async findByChallengeIdAndNumber(
    challengeId: string,
    caseNumber: number,
  ): Promise<Testcase | null> {
    const testcase = await this.prisma.testcase.findUnique({
      where: {
        challengeId_caseNumber: {
          challengeId,
          caseNumber,
        },
      },
    });
    return testcase ? this.toDomain(testcase) : null;
  }

  async update(data: Partial<Testcase>): Promise<Testcase> {
    const testcase = await this.prisma.testcase.update({
      where: {
        challengeId_caseNumber: {
          challengeId: data.challengeId!,
          caseNumber: data.caseNumber!,
        },
      },
      data: {
        input: data.input,
        output: data.output,
        visible: data.visible,
      },
    });
    return this.toDomain(testcase);
  }

  async delete(challengeId: string, caseNumber: number): Promise<void> {
    await this.prisma.testcase.delete({
      where: {
        challengeId_caseNumber: {
          challengeId,
          caseNumber,
        },
      },
    });
  }

  private toDomain(raw: any): Testcase {
    return new Testcase(
      raw.challengeId,
      raw.caseNumber,
      raw.input,
      raw.output,
      raw.visible,
    );
  }
}
