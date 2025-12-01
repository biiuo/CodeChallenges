export declare class SignupRequest {
    email: string;
    password: string;
    name: string;
    username: string;
    role?: string;
}
export declare class LoginRequest {
    email: string;
    password: string;
}
export declare class TokenResponse {
    access: string;
    refresh: string;
}
