import { CreateCourseUseCase } from '../../application/usesCases/course/createcourse.usecase';
import { FindCourseByCodeUseCase } from '../../application/usesCases/course/findcourse.usecase';
import { FindAllCoursesUseCase } from '../../application/usesCases/course/findallcourse.usecase';
import { UpdateCourseUseCase } from '../../application/usesCases/course/updatecourse.usecase';
import { DeleteCourseUseCase } from '../../application/usesCases/course/deletecourse.usecase';
import { AddChallengesToCourseUseCase } from '../../application/usesCases/course/addchallengestocourse.usecase';
import { RemoveChallengesFromCourseUseCase } from '../../application/usesCases/course/removechallengesfromcourse.usecase';
import { GetCourseChallengesUseCase } from '../../application/usesCases/course/getcoursechallenges.usecase';
import { GetCourseStatisticsUseCase } from '../../application/usesCases/course/getcoursestatistics.usecase';
import { CloneChallengesToCourseUseCase } from '../../application/usesCases/course/clonechallengstocourse.usecase';
import { PublishCourseUseCase } from '../../application/usesCases/course/publishcourse.usecase';
import { CreateCourseDTO, AddChallengesToCourseDTO, RemoveChallengesToCourseDTO } from '../../application/dtos/course';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
export declare class CoursesController {
    private readonly createCourse;
    private readonly findCourse;
    private readonly getAllCourses;
    private readonly updateCourse;
    private readonly deleteCourse;
    private readonly addChallengesToCourse;
    private readonly removeChallengesFromCourse;
    private readonly getCourseChallenges;
    private readonly getCourseStatistics;
    private readonly cloneChallengesToCourse;
    private readonly publishCourse;
    private readonly prisma?;
    constructor(createCourse: CreateCourseUseCase, findCourse: FindCourseByCodeUseCase, getAllCourses: FindAllCoursesUseCase, updateCourse: UpdateCourseUseCase, deleteCourse: DeleteCourseUseCase, addChallengesToCourse: AddChallengesToCourseUseCase, removeChallengesFromCourse: RemoveChallengesFromCourseUseCase, getCourseChallenges: GetCourseChallengesUseCase, getCourseStatistics: GetCourseStatisticsUseCase, cloneChallengesToCourse: CloneChallengesToCourseUseCase, publishCourse: PublishCourseUseCase, prisma?: PrismaService | undefined);
    create(dto: CreateCourseDTO): Promise<import("../../domain/entities/course.entity").Course>;
    findAll(): Promise<import("../../domain/entities/course.entity").Course[]>;
    findMy(req: any): Promise<import("../../domain/entities/course.entity").Course[] | ({
        _count: {
            challenges: number;
            students: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        period: string;
        category: string | null;
        level: string | null;
        group: string | null;
        coverImage: string | null;
        isPublished: boolean;
    })[]>;
    findOne(code: string): Promise<import("../../domain/entities/course.entity").Course>;
    update(code: string, dto: any): Promise<import("../../domain/entities/course.entity").Course>;
    remove(code: string): Promise<void>;
    addChallenges(courseId: string, dto: AddChallengesToCourseDTO): Promise<{
        message: string;
        addedCount: number;
        alreadyInCourse: string[];
    }>;
    removeChallenges(courseId: string, dto: RemoveChallengesToCourseDTO): Promise<{
        message: string;
        removedCount: number;
    }>;
    getChallenges(courseId: string): Promise<any[]>;
    getStatistics(courseId: string): Promise<import("../../application/usesCases/course/getcoursestatistics.usecase").CourseStatistics>;
    cloneChallenges(targetCourseId: string, sourceCourseId: string): Promise<{
        message: string;
        clonedCount: number;
        skippedCount: number;
    }>;
    publishUnpublish(courseId: string, body: {
        isPublished: boolean;
    }): Promise<{
        message: string;
        courseId: string;
        isPublished: boolean;
    }>;
}
