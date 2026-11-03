import { Injectable, Logger } from '@nestjs/common';
import { Inventory } from './inventory.model';
import { Mod023Service } from 'MOD-023'; // Assuming MOD-023 handles product details
import { Mod024Service } from 'MOD-024'; // Assuming MOD-024 handles order details

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  private inventory: Inventory[] = [];

  constructor(
    private readonly mod023Service: Mod023Service,
    private readonly mod024Service: Mod024Service
  ) {}

  async initializeInventory(): Promise<void> {
    // Load initial inventory data from database or external source.
    // For now, let's assume an empty inventory.  In a real application, 
    // you would populate this from a database.
    this.inventory = [];
    const products = await this.mod023Service.getAllProducts(); // Get all products from MOD-023
    for (const product of products) {
      // Initialize inventory for each product.  Start with a default quantity.
      this.inventory.push({
        productId: product.id,
        quantityOnHand: 0,
        lastUpdated: new Date(),
      });
    }
  }

  async getInventory(productId: string): Promise<Inventory | undefined> {
    return this.inventory.find((item) => item.productId === productId);
  }

  async updateInventory(productId: string, quantityChange: number): Promise<void> {
    const inventoryItem = this.inventory.find((item) => item.productId === productId);

    if (!inventoryItem) {
      this.logger.warn(`Inventory item not found for product ID: ${productId}`);
      return;
    }

    const newQuantity = inventoryItem.quantityOnHand + quantityChange;

    if (newQuantity < 0) {
      throw new Error(`Insufficient stock for product ID: ${productId}.  Attempted to set quantity to ${newQuantity}.`);
    }

    inventoryItem.quantityOnHand = newQuantity;
    inventoryItem.lastUpdated = new Date();
    // In a real application, update the database here.
    this.logger.log(`Inventory updated for product ID: ${productId}. New quantity: ${newQuantity}`);
  }

  async allocateStock(orderId: string): Promise<boolean> {
    try {
      const order = await this.mod024Service.getOrderDetails(orderId);
      if (!order) {
        this.logger.warn(`Order not found for order ID: ${orderId}`);
        return false;
      }

      const orderItems = order.items;
      for (const item of orderItems) {
        const productId = item.productId;
        const quantity = item.quantity;

        const inventoryItem = this.inventory.find((item) => item.productId === productId);

        if (!inventoryItem) {
          this.logger.error(`Inventory not found for product ID: ${productId}`);
          return false; // Or throw an error
        }

        if (inventoryItem.quantityOnHand < quantity) {
          this.logger.warn(`Insufficient stock for product ID: ${productId}.  Available: ${inventoryItem.quantityOnHand}, Requested: ${quantity}`);
          return false;
        }
      }

      // If all products have sufficient stock, allocate the stock.
      for (const item of orderItems) {
        const productId = item.productId;
        const quantity = item.quantity;
        await this.updateInventory(productId, -quantity);
      }

      return true;
    } catch (error) {
      this.logger.error(`Error allocating stock for order ID: ${orderId}`, error.stack);
      return false;
    }
  }

  async handleReturn(orderId: string): Promise<void> {
    try {
      const order = await this.mod024Service.getOrderDetails(orderId);
      if (!order) {
        this.logger.warn(`Order not found for order ID: ${orderId}`);
        return;
      }

      const orderItems = order.items;
      for (const item of orderItems) {
        const productId = item.productId;
        const quantity = item.quantity;
        await this.updateInventory(productId, quantity);
      }
      this.logger.log(`Return processed for order ID: ${orderId}`);
    } catch (error) {
      this.logger.error(`Error handling return for order ID: ${orderId}`, error.stack);
    }
  }

  async handleDamage(productId: string, quantity: number): Promise<void> {
    try {
      await this.updateInventory(productId, -quantity);
      this.logger.log(`Damaged inventory processed for product ID: ${productId}, quantity: ${quantity}`);
    } catch (error) {
      this.logger.error(`Error handling damaged inventory for product ID: ${productId}`, error.stack);
    }
  }

  async handleExpiration(productId: string, quantity: number): Promise<void> {
    try {
      await this.updateInventory(productId, -quantity);
      this.logger.log(`Expired inventory processed for product ID: ${productId}, quantity: ${quantity}`);
    } catch (error) {
      this.logger.error(`Error handling expired inventory for product ID: ${productId}`, error.stack);
    }
  }
}