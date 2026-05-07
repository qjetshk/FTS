import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { OrganizationModule } from './organization/organization.module';
import { ProductModule } from './product/product.module';
import { StatformModule } from './statform/statform.module';

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule.forRoot({ isGlobal: true }), OrganizationModule, ProductModule, StatformModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
