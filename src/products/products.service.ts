import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);

      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const query = await this.productRepository.find({
      take: limit,
      skip: offset,
    });
    return query;
  }

  async findOne(id: string) {
    let product: Product;
    if (isUUID(id))
      product = await this.productRepository.findOneBy({ id: id });
    else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where(`LOWER(title) =:title or LOWER(slug) =:slug`, {
          title: id.toLowerCase(),
          slug: id.toLowerCase(),
        })
        .getOne();
    }

    if (!product)
      throw new BadRequestException('The requested product doesnt exist');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if (!isUUID(id)) throw new BadRequestException('invalid product id');
    const query = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });
    if (!query)
      throw new BadRequestException('The requested product doesnt exist');

    return await this.productRepository.save(query);
  }

  async remove(id: string) {
    try {
      const query = await this.productRepository.findOneBy({ id: id });
      await this.productRepository.remove(query);
      return { message: `The product ${id} has been deleted` };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  private handleExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);

    this.logger.error(error);
    throw new InternalServerErrorException('Help!');
  }
}
