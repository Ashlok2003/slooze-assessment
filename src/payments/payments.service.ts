import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentMethodInput } from './dto/create-payment-method.input';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  create(createPaymentMethodInput: CreatePaymentMethodInput) {
    return this.prisma.paymentMethod.create({
      data: createPaymentMethodInput,
      include: { user: true },
    });
  }

  findAll() {
    return this.prisma.paymentMethod.findMany({
      include: { user: true },
    });
  }
}
