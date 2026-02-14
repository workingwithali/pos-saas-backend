import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}
