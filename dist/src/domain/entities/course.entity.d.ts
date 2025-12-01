export declare class Course {
    id: string;
    code: string;
    name: string;
    period: string;
    description?: string | undefined;
    category?: string | undefined;
    level?: string | undefined;
    group?: string | undefined;
    coverImage?: string | undefined;
    isPublished?: boolean | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    constructor(id: string, code: string, name: string, period: string, description?: string | undefined, category?: string | undefined, level?: string | undefined, group?: string | undefined, coverImage?: string | undefined, isPublished?: boolean | undefined, createdAt?: Date | undefined, updatedAt?: Date | undefined);
}
