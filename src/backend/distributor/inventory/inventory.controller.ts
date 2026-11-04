import { Body, Controller, Get, Param, Put, Post, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory } from './inventory.model';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Get()
    async getAllInventory(): Promise<Inventory[]> {
        return this.inventoryService.getAllInventory();
    }

    @Get(':productId')
    async getInventoryById(@Param('productId') productId: string): Promise<Inventory> {
        return this.inventoryService.getInventoryById(productId);
    }

    @Put(':productId')
    @HttpCode(HttpStatus.OK)
    async updateInventory(@Param('productId') productId: string, @Body() inventory: Inventory): Promise<Inventory> {
        // Input validation to prevent injection attacks
        if (typeof inventory.quantity_on_hand !== 'number' || inventory.quantity_on_hand < 0) {
            throw new Error('Invalid quantity_on_hand. Must be a non-negative number.');
        }

        return this.inventoryService.updateInventory(productId, inventory);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createInventory(@Body() inventory: Inventory): Promise<Inventory> {
        // Input validation to prevent injection attacks
        if (typeof inventory.quantity_on_hand !== 'number' || inventory.quantity_on_hand < 0) {
            throw new Error('Invalid quantity_on_hand. Must be a non-negative number.');
        }

        return this.inventoryService.createInventory(inventory);
    }

    @Delete(':productId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteInventory(@Param('productId') productId: string): Promise<void> {
        return this.inventoryService.deleteInventory(productId);
    }

    // Example endpoint to handle order fulfillment and update inventory
    @Post('fulfillOrder')
    @HttpCode(HttpStatus.OK)
    async fulfillOrder(@Body() { productId: productId, quantity: quantity }: { productId: string, quantity: number }): Promise<boolean> {
        try {
            const currentInventory = await this.inventoryService.getInventoryById(productId);

            if (!currentInventory) {
                return false; // Product not found
            }

            if (currentInventory.quantity_on_hand < quantity) {
                return false; // Not enough stock
            }

            currentInventory.quantity_on_hand -= quantity;
            await this.inventoryService.updateInventory(productId, currentInventory);
            return true; // Order fulfilled successfully
        } catch (error) {
            // Log error and potentially re-throw or handle gracefully
            console.error('Error fulfilling order:', error);
            return false; // Order fulfillment failed
        }
    }

    // Example endpoint to handle returns and refunds
    @Post('returnOrder')
    @HttpCode(HttpStatus.OK)
    async returnOrder(@Body() { productId: productId, quantity: quantity }: { productId: string, quantity: number }): Promise<boolean> {
        try {
            const currentInventory = await this.inventoryService.getInventoryById(productId);

            if (!currentInventory) {
                return false; // Product not found
            }
            currentInventory.quantity_on_hand += quantity;
            await this.inventoryService.updateInventory(productId, currentInventory);
            return true; // Return processed successfully
        } catch (error) {
            console.error('Error processing return:', error);
            return false;
        }
    }
}