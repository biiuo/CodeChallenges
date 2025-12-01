import { CreateChallengeDto, CreateTestCaseDto } from '../../application/dtos/challenges';
import { UpdateChallengeDto } from '../../application/dtos/challenges';
import { CreateChallengeUseCase } from '../../application/usesCases/challenge/createchallenge.usecase';
import { FindChallengeByIdUseCase } from '../../application/usesCases/challenge/findchallengebyid.usecase';
import { FindAllChallengesUseCase } from '../../application/usesCases/challenge/findallchallenges.usecase';
import { UpdateChallengeUseCase } from '../../application/usesCases/challenge/updatechallenge.usecase';
import { DeleteChallengeUseCase } from '../../application/usesCases/challenge/deletechallenge.usecase';
import type { ChallengeRepository } from '../../domain/repositories/challenge.repository';
export declare class ChallengesController {
    private readonly createChallengeUseCase;
    private readonly getChallengeByIdUseCase;
    private readonly getAllChallengesUseCase;
    private readonly updateChallengeUseCase;
    private readonly deleteChallengeUseCase;
    private readonly challengeRepo;
    constructor(createChallengeUseCase: CreateChallengeUseCase, getChallengeByIdUseCase: FindChallengeByIdUseCase, getAllChallengesUseCase: FindAllChallengesUseCase, updateChallengeUseCase: UpdateChallengeUseCase, deleteChallengeUseCase: DeleteChallengeUseCase, challengeRepo: ChallengeRepository);
    create(data: CreateChallengeDto, req: any): Promise<import("../../domain/entities/challenge.entity").Challenge>;
    findAll(): Promise<import("../../domain/entities/challenge.entity").Challenge[]>;
    findOne(id: string, req: any): Promise<import("../../domain/entities/challenge.entity").Challenge>;
    update(id: string, data: UpdateChallengeDto): Promise<import("../../domain/entities/challenge.entity").Challenge>;
    delete(id: string): Promise<void>;
    uploadSolution(challengeId: string, body: {
        code: string;
        language: string;
    }): Promise<{
        message: string;
        challengeId: string;
    }>;
    addTestCases(challengeId: string, testcases: CreateTestCaseDto[]): Promise<{
        message: string;
        count: number;
    }>;
}
