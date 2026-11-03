import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Product } from './products.model';

// In a real application, this would connect to a database.
// For this example, we'll use an in-memory array.
let products: Product[] = [];
let nextId = 1;

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  async create(name: string, description: string, distributorId: number): Promise<Product> {
    if (!name || !distributorId) {
      throw new BadRequestException('Name and distributorId are required.');
    }

    if (name.length > 255) {
      throw new BadRequestException('Name cannot exceed 255 characters.');
    }
    
    const newProduct = {
      id: nextId++,
      name,
      description,
      distributorId,
    };

    products.push(newProduct);
    this.logger.log(`Created product with id: ${newProduct.id}`);
    return newProduct;
  }

  async findAll(): Promise<Product[]> {
    this.logger.log('Fetching all products');
    return products;
  }

  async findOne(id: number): Promise<Product> {
    const product = products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    this.logger.log(`Found product with id: ${id}`);
    return product;
  }

  async update(id: number, name: string, description: string, distributorId: number): Promise<Product> {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    if (name && name.length > 255) {
      throw new BadRequestException('Name cannot exceed 255 characters.');
    }

    const updatedProduct = {
      ...products[index],
      name: name !== undefined ? name : products[index].name,
      description: description !== undefined ? description : products[index].description,
      distributorId: distributorId !== undefined ? distributorId : products[index].distributorId,
    };

    products[index] = updatedProduct;
    this.logger.log(`Updated product with id: ${id}`);
    return updatedProduct;
  }

  async remove(id: number): Promise<void> {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    products.splice(index, 1);
    this.logger.log(`Deleted product with id: ${id}`);
  }

  async search(query: string): Promise<Product[]> {
    if (!query) {
      return this.findAll();
    }

    const lowerCaseQuery = query.toLowerCase();
    const results = products.filter((product) =>
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      product.description.toLowerCase().includes(lowerCaseQuery)
    );
    this.logger.log(`Search query: ${query}, found ${results.length} results`);
    return results;
  }
}