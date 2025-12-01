export declare enum Role {
    STUDENT = "STUDENT",
    ADMIN = "ADMIN",
    PROFESSOR = "PROFESSOR"
}
export declare class User {
    id: string;
    name: string;
    username: string;
    email: string;
    private _password;
    role: Role;
    constructor(id: string, name: string, username: string, email: string, _password: string, role: Role);
    get passwordHash(): string;
    setPasswordHash(newHash: string): void;
}
