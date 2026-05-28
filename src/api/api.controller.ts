import { Controller, Post, Body } from '@nestjs/common';
import { ApiService } from './api.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('subscriptions')
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.apiService.create(createSubscriptionDto);
  }
}
