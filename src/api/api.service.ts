import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateSubscriptionDto,
  ResponseSubscriptionDto,
} from './dto/create-subscription.dto.js';

const createPrefixedId = (prefix: string) =>
  `${prefix}_${randomUUID().replaceAll('-', '').slice(0, 8)}`;

@Injectable()
export class ApiService {
  constructor(private prisma: PrismaService) {}
  async create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<ResponseSubscriptionDto> {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { id: createSubscriptionDto.planId },
      });

      if (!plan) {
        throw new BadRequestException('Plan not found');
      }

      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      const subscriptionId = createPrefixedId('sub');
      const eventId = createPrefixedId('evt');

      const newSubscription = await this.prisma.$transaction(async (prisma) => {
        const subscription = await prisma.subscription.create({
          data: {
            id: subscriptionId,
            plan: { connect: { id: plan.id } },
            customerEmail: createSubscriptionDto.customerEmail,
            status: 'PENDING',
            nextBillingDate,
          },
        });

        await prisma.event.create({
          data: {
            id: eventId,
            type: 'subscription_created',
            data: {
              subscription_id: subscription.id,
              plan_id: plan.id,
              customer_email: subscription.customerEmail,
            },
          },
        });

        return subscription;
      });

      return {
        subscription_id: newSubscription.id,
        status: newSubscription.status.toLowerCase(),
        next_billing_date: newSubscription.nextBillingDate
          .toISOString()
          .slice(0, 10),
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
