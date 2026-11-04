import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Order } from './orders.model';
import { Mod022Service } from 'MOD-022'; // Assuming MOD-022 handles inventory and authorization

@Injectable()
export class OrdersService {
  constructor(private readonly mod022Service: Mod022Service) {}

  async updateOrderStatus(orderId: string, status: string): Promise<{ status: string }> {
    // Authorization check - verify distributor has access to the order.
    if (!await this.mod022Service.verifyDistributorAccessToOrder(orderId)) {
      throw new NotFoundException('Order not found or distributor does not have access.');
    }

    // Validate status
    const validStatuses = ['fulfilled', 'cancelled', 'in_progress', 'pending'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    let order: Order | null = await this.getOrderById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;

    if (status === 'fulfilled') {
      try {
        // Update inventory via MOD-022
        await this.mod022Service.updateInventoryForOrder(orderId);
      } catch (error) {
        throw new Error(`Failed to update inventory: ${error.message}`);
      }
    } else if (status === 'cancelled') {
      // Handle cancellation logic (e.g., refund, notify parties)
      // Implement any necessary cancellation-specific operations here.
      await this.handleOrderCancellation(order);
    }

    // Save the updated order (assuming MOD-022 handles persistence)
    await this.mod022Service.saveOrder(order);

    return { status: order.status };
  }

  private async getOrderById(orderId: string): Promise<Order | null> {
    // Retrieve order from database using MOD-022
    const order = await this.mod022Service.getOrderById(orderId);
    return order;
  }

  private async handleOrderCancellation(order: Order): Promise<void> {
    // Implement cancellation logic.  This could include:
    // - Reverting inventory reservations
    // - Notifying the chemist
    // - Triggering a refund process
    try {
      await this.mod022Service.revertInventoryForOrder(order.id);
    } catch (error) {
      console.error("Error reverting inventory during cancellation:", error);
      // Potentially re-throw or handle the error appropriately.
    }
  }
}