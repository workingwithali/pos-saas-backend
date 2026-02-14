import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import configuration from './config/configuration';

import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [PrismaModule, AuthModule, TenantsModule, UsersModule, ProductsModule, SalesModule, SubscriptionsModule, CategoriesModule,
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], }),
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
