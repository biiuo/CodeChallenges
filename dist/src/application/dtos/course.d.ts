export declare class CreateCourseDTO {
    code: string;
    name: string;
    period: string;
    description?: string;
    category?: string;
    level?: string;
    group?: string;
    coverImage?: string;
    isPublished?: boolean;
    professorCode?: string[];
}
export declare class UpdateCourseDto {
    code?: string;
    name?: string;
    period?: string;
    description?: string;
    category?: string;
    level?: string;
    group?: string;
    coverImage?: string;
    isPublished?: boolean;
    professorCode?: string[];
}
export declare class AddChallengesToCourseDTO {
    challengeIds: string[];
}
export declare class RemoveChallengesToCourseDTO {
    challengeIds: string[];
}
