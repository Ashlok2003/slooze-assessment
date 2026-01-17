import { Module } from '@nestjs/common';
import { SharedCartsService } from './shared-carts.service';
import { SharedCartsResolver } from './shared-carts.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SharedCartsService, SharedCartsResolver],
  exports: [SharedCartsService],
})
export class SharedCartsModule { }
