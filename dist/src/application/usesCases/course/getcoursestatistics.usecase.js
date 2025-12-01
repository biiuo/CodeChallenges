"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCourseStatisticsUseCase = void 0;
const course_exceptions_1 = require("../../exceptions/course.exceptions");
class GetCourseStatisticsUseCase {
    courseRepo;
    prisma;
    constructor(courseRepo, prisma) {
        this.courseRepo = courseRepo;
        this.prisma = prisma;
    }
    async execute(courseId) {
        const course = await this.courseRepo.findById(courseId);
        if (!course) {
            throw new course_exceptions_1.CourseNotFoundException(courseId);
        }
        const courseData = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                students: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                            },
                        },
                    },
                },
                challenges: {
                    include: {
                        submissions: {
                            where: { courseId },
                        },
                    },
                },
                submissions: true,
            },
        });
        if (!courseData) {
            throw new course_exceptions_1.CourseNotFoundException(courseId);
        }
        const challengeStats = courseData.challenges.map((challenge) => {
            const totalAttempts = challenge.submissions.length;
            const successfulSubmissions = challenge.submissions.filter((s) => s.status === 'ACCEPTED').length;
            const successRate = totalAttempts > 0
                ? (successfulSubmissions / totalAttempts) * 100
                : 0;
            return {
                challengeId: challenge.id,
                title: challenge.title,
                difficulty: challenge.difficulty,
                totalAttempts,
                successfulSubmissions,
                successRate: Math.round(successRate * 100) / 100,
            };
        });
        const studentProgress = courseData.students.map((enrollment) => {
            const studentSubmissions = courseData.submissions.filter((s) => s.userId === enrollment.userId);
            const uniqueChallenges = new Set(studentSubmissions
                .filter((s) => s.status === 'ACCEPTED')
                .map((s) => s.challengeId));
            const totalScore = studentSubmissions
                .filter((s) => s.score !== null)
                .reduce((sum, s) => sum + (s.score || 0), 0);
            const averageScore = studentSubmissions.length > 0
                ? totalScore / studentSubmissions.length
                : 0;
            return {
                studentId: enrollment.user.id,
                studentName: enrollment.user.name,
                challengesCompleted: uniqueChallenges.size,
                totalSubmissions: studentSubmissions.length,
                averageScore: Math.round(averageScore * 100) / 100,
            };
        });
        return {
            courseId: courseData.id,
            courseName: courseData.name,
            totalStudents: courseData.students.length,
            totalChallenges: courseData.challenges.length,
            totalSubmissions: courseData.submissions.length,
            challengeStats,
            studentProgress,
        };
    }
}
exports.GetCourseStatisticsUseCase = GetCourseStatisticsUseCase;
//# sourceMappingURL=getcoursestatistics.usecase.js.map