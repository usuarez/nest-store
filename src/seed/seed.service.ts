import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const user = await this.insertUsers();
    await this.insertNewProducts(user);
    return 'seed executed';
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach((user) => {
      user.password = bcrypt.hashSync(user.password, 10);
      users.push(this.userRepository.create(user));
    });
    const dbUsers = await this.userRepository.save(seedUsers);

    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;
    const insertPromises = [];
    products.forEach((pr) =>
      insertPromises.push(this.productsService.create(pr, user)),
    );

    //const results = await Promise.all(insertPromises);

    return true;
  }
}
