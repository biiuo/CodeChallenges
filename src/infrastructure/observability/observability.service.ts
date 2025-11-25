import { Injectable, Logger } from '@nestjs/common';

export interface SubmissionMetrics {
  submissionId: string;
  event: 'queued' | 'started' | 'caseResult' | 'finished' | 'error';
  timestamp: string;
  language?: string;
  status?: string;
  durationMs?: number;
  caseId?: number;
  runnerImage?: string;
  errorMessage?: string;
}

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);

  private metrics = {
    submissions_total: 0,
    submissions_accepted: 0,
    submissions_wrong_answer: 0,
    submissions_time_limit_exceeded: 0,
    submissions_runtime_error: 0,
    submissions_compilation_error: 0,
    submissions_failed_total: 0,
    total_execution_time_ms: 0,
    execution_count: 0,
    active_runners: 0,
  };

  /**
   * Log submission event in JSON format with tracing info.
   */
  logSubmissionEvent(event: SubmissionMetrics): void {
    const logEntry = {
      level: event.event === 'error' ? 'error' : 'info',
      timestamp: event.timestamp,
      submissionId: event.submissionId,
      event: event.event,
      language: event.language,
      status: event.status,
      durationMs: event.durationMs,
      caseId: event.caseId,
      runnerImage: event.runnerImage,
      errorMessage: event.errorMessage,
    };

    if (event.event === 'error') {
      this.logger.error(JSON.stringify(logEntry));
    } else {
      this.logger.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Record a submission attempt.
   */
  recordSubmission(status: string): void {
    this.metrics.submissions_total++;

    switch (status) {
      case 'ACCEPTED':
        this.metrics.submissions_accepted++;
        break;
      case 'WRONG_ANSWER':
        this.metrics.submissions_wrong_answer++;
        break;
      case 'TIME_LIMIT_EXCEEDED':
        this.metrics.submissions_time_limit_exceeded++;
        break;
      case 'RUNTIME_ERROR':
        this.metrics.submissions_runtime_error++;
        break;
      case 'COMPILATION_ERROR':
        this.metrics.submissions_compilation_error++;
        break;
      case 'ERROR':
        this.metrics.submissions_failed_total++;
        break;
    }
  }

  /**
   * Record execution time.
   */
  recordExecutionTime(durationMs: number): void {
    this.metrics.total_execution_time_ms += durationMs;
    this.metrics.execution_count++;
  }

  /**
   * Increment active runners count.
   */
  incrementActiveRunners(): void {
    this.metrics.active_runners++;
  }

  /**
   * Decrement active runners count.
   */
  decrementActiveRunners(): void {
    this.metrics.active_runners = Math.max(0, this.metrics.active_runners - 1);
  }

  /**
   * Get current metrics in Prometheus-compatible format.
   */
  getMetricsPrometheus(): string {
    const avgTime =
      this.metrics.execution_count > 0
        ? (this.metrics.total_execution_time_ms / this.metrics.execution_count).toFixed(2)
        : 0;

    return `# HELP submissions_total Total number of submissions processed
# TYPE submissions_total counter
submissions_total ${this.metrics.submissions_total}

# HELP submissions_accepted Total accepted submissions
# TYPE submissions_accepted counter
submissions_accepted ${this.metrics.submissions_accepted}

# HELP submissions_wrong_answer Total wrong answer submissions
# TYPE submissions_wrong_answer counter
submissions_wrong_answer ${this.metrics.submissions_wrong_answer}

# HELP submissions_time_limit_exceeded Total time limit exceeded submissions
# TYPE submissions_time_limit_exceeded counter
submissions_time_limit_exceeded ${this.metrics.submissions_time_limit_exceeded}

# HELP submissions_runtime_error Total runtime error submissions
# TYPE submissions_runtime_error counter
submissions_runtime_error ${this.metrics.submissions_runtime_error}

# HELP submissions_compilation_error Total compilation error submissions
# TYPE submissions_compilation_error counter
submissions_compilation_error ${this.metrics.submissions_compilation_error}

# HELP submissions_failed_total Total failed submissions (internal errors)
# TYPE submissions_failed_total counter
submissions_failed_total ${this.metrics.submissions_failed_total}

# HELP average_execution_time_ms Average execution time in milliseconds
# TYPE average_execution_time_ms gauge
average_execution_time_ms ${avgTime}

# HELP active_runners Current number of active runner containers
# TYPE active_runners gauge
active_runners ${this.metrics.active_runners}
`;
  }

  /**
   * Get current metrics as JSON.
   */
  getMetricsJson() {
    const avgTime =
      this.metrics.execution_count > 0
        ? this.metrics.total_execution_time_ms / this.metrics.execution_count
        : 0;

    return {
      submissions_total: this.metrics.submissions_total,
      submissions_accepted: this.metrics.submissions_accepted,
      submissions_wrong_answer: this.metrics.submissions_wrong_answer,
      submissions_time_limit_exceeded: this.metrics.submissions_time_limit_exceeded,
      submissions_runtime_error: this.metrics.submissions_runtime_error,
      submissions_compilation_error: this.metrics.submissions_compilation_error,
      submissions_failed_total: this.metrics.submissions_failed_total,
      average_execution_time_ms: avgTime,
      active_runners: this.metrics.active_runners,
    };
  }
}
