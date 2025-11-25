import { Controller, Get } from '@nestjs/common';
import { ObservabilityService } from 'src/infrastructure/observability/observability.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly observability: ObservabilityService) {}

  @Get('prometheus')
  getMetricsPrometheus(): string {
    return this.observability.getMetricsPrometheus();
  }

  @Get('json')
  getMetricsJson() {
    return this.observability.getMetricsJson();
  }
}
