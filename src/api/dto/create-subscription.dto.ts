import { IsNotEmpty, IsString } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { SubscriptionStatus } from '@prisma/client';

type CreateSubscriptionBody = {
  plan_id?: string;
  customer_email?: string;
};

const mapPlanId = ({ obj }: { obj: CreateSubscriptionBody }) => obj.plan_id;

const mapCustomerEmail = ({ obj }: { obj: CreateSubscriptionBody }) =>
  obj.customer_email;

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  @Transform(mapPlanId, { toClassOnly: true })
  readonly planId: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  @Transform(mapCustomerEmail, { toClassOnly: true })
  readonly customerEmail: string;
}

export class ResponseSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'subscription_id' })
  readonly subscriptionId: string;

  @IsNotEmpty()
  readonly status: SubscriptionStatus;

  @IsNotEmpty()
  @Expose({ name: 'next_billing_date' })
  readonly nextBillingDate: string;
}
