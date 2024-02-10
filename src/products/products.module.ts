import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Service
import { ProductsService } from './products.service';

// Controller
import { ProductsController } from './products.controller';

// Entity
import { Product } from './entities/product.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [TypeOrmModule.forFeature([Product])],
})
export class ProductsModule {}
