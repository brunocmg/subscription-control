import { Module } from '@nestjs/common';
import { ApiController } from './api.controller.js';
import { ApiService } from './api.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
