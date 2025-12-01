import { ObservabilityService } from 'src/infrastructure/observability/observability.service';
export declare class MetricsController {
    private readonly observability;
    constructor(observability: ObservabilityService);
    getMetricsPrometheus(): Promise<string>;
    getMetricsJson(): Promise<{
        submissions_total: number;
        submissions_accepted: number;
        submissions_wrong_answer: number;
        submissions_time_limit_exceeded: number;
        submissions_runtime_error: number;
        submissions_compilation_error: number;
        submissions_failed_total: number;
        average_execution_time_ms: number;
        active_runners: number;
    }>;
}
