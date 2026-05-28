import { IsNotEmpty, IsString } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

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
  readonly subscription_id: string;

  @IsNotEmpty()
  readonly status: string;

  @IsNotEmpty()
  readonly next_billing_date: string;
}
