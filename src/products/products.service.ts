import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isUUID } from 'uuid';

// DTO
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

// Entity
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  private readonly logger = new Logger(ProductsService.name);

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (err) {
      this.hamdleError(err);
    }
  }

  async findAll({ limit = 10, offset = 0 }: PaginationDto) {
    return await this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product: Product | undefined;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(title) = :title or slug = :slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .getOne();
    }

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if (!product) throw new NotFoundException('Product not found');

    try {
      return await this.productRepository.save(product);
    } catch (err) {
      this.hamdleError(err);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    try {
      await this.productRepository.remove(product);
    } catch (err) {
      this.hamdleError(err);
    }
  }

  private hamdleError(err: any) {
    this.logger.error(err.message);

    if (err.code === '23505') {
      throw new BadRequestException(err.detail || 'Error creating product');
    }
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
