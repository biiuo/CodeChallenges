import { Controller, Get } from '@nestjs/common';
import { ObservabilityService } from 'src/infrastructure/observability/observability.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly observability: ObservabilityService) {}

  @Get('prometheus')
  async getMetricsPrometheus(): Promise<string> {
    return await this.observability.getMetricsPrometheus();
  }

  @Get('json')
  async getMetricsJson() {
    return await this.observability.getMetricsJson();
  }
}
