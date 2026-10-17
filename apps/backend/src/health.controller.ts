import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string; service: string; timestamp: string } {
    return {
      status: 'UP',
      service: 'backend',
      timestamp: new Date().toISOString(),
    };
  }
}
