import { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { Product } from './products.model';
import { validate } from 'class-validator';

const productsService = new ProductsService();

export class ProductsController {

    async createProduct(req: Request, res: Response) {
        try {
            const { name, description, distributorId } = req.body;

            // Input validation
            if (!name || !description || !distributorId) {
                return res.status(400).json({ message: 'Name, description, and distributor ID are required.' });
            }

            const newProduct = new Product();
            newProduct.name = name;
            newProduct.description = description;
            newProduct.distributorId = distributorId;

            const errors = await validate(newProduct);
            if (errors.length > 0) {
                return res.status(400).json({ message: 'Validation failed', errors });
            }

            const createdProduct = await productsService.create(newProduct);
            res.status(201).json(createdProduct);

        } catch (error: any) {
            console.error('Error creating product:', error);
            res.status(500).json({ message: 'Failed to create product', error: error.message });
        }
    }

    async getProducts(req: Request, res: Response) {
        try {
            const { distributorId } = req.query;

            let products: Product[];

            if (distributorId) {
                products = await productsService.findByDistributor(Number(distributorId));
            } else {
                products = await productsService.getAll();
            }
            
            res.json(products);

        } catch (error: any) {
            console.error('Error getting products:', error);
            res.status(500).json({ message: 'Failed to get products', error: error.message });
        }
    }

    async getProductById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const product = await productsService.findById(Number(id));

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json(product);

        } catch (error: any) {
            console.error('Error getting product by id:', error);
            res.status(500).json({ message: 'Failed to get product', error: error.message });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, description, distributorId } = req.body;

            // Input validation
            if (!name || !description || !distributorId) {
                return res.status(400).json({ message: 'Name, description, and distributor ID are required.' });
            }

            const updatedProduct = new Product();
            updatedProduct.id = Number(id);
            updatedProduct.name = name;
            updatedProduct.description = description;
            updatedProduct.distributorId = distributorId;
            
            const errors = await validate(updatedProduct);
            if (errors.length > 0) {
                return res.status(400).json({ message: 'Validation failed', errors });
            }

            const updated = await productsService.update(updatedProduct);

            if (!updated) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json(updatedProduct);

        } catch (error: any) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Failed to update product', error: error.message });
        }
    }

    async deleteProduct(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deleted = await productsService.delete(Number(id));

            if (!deleted) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(204).send();

        } catch (error: any) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Failed to delete product', error: error.message });
        }
    }

    async searchProducts(req: Request, res: Response) {
        try {
            const { query } = req.query;

            if (!query) {
                return res.status(400).json({ message: 'Search query is required.' });
            }

            const results = await productsService.search(String(query));
            res.json(results);

        } catch (error: any) {
            console.error('Error searching products:', error);
            res.status(500).json({ message: 'Failed to search products', error: error.message });
        }
    }
}