export declare function normalize(text: string | null | undefined): string;
export declare function compareOutputs(studentOutput: string, expectedOutput: string): 'OK' | 'WRONG_ANSWER';
export declare function truncateOutput(text: string | null | undefined, maxLength?: number): string;
