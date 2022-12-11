import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    const { images = [], ...productDetails } = createProductDto;
    try {
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((img) =>
          this.productImageRepository.create({ url: img }),
        ),
        user,
      });

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
      relations: {
        images: true,
      },
    });
    return query;
  }

  async findOne(id: string) {
    let product: Product;
    if (isUUID(id))
      product = await this.productRepository.findOneBy({ id: id });
    else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(`LOWER(title) =:title or LOWER(slug) =:slug`, {
          title: id.toLowerCase(),
          slug: id.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new BadRequestException('The requested product doesnt exist');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    if (!isUUID(id)) throw new BadRequestException('invalid product id');

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate,
    });
    if (!product)
      throw new BadRequestException('The requested product doesnt exist');

    //create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (images) {
        //delete old images
        await queryRunner.manager.delete(ProductImage, {
          product: { id },
        });
        //push new images
        product.images = images.map((img) =>
          this.productImageRepository.create({ url: img }),
        );
      }

      product.user = user;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleExceptions(error);
    }
  }

  async remove(id: string, user: User) {
    try {
      const query = await this.productRepository.findOneBy({ id: id });
      await this.productRepository.remove(query);
      return { message: `The product ${id} has been deleted` };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
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
