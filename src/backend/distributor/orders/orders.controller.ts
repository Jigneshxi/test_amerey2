import { Controller, Put, Param, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { DistributorGuard } from 'src/distributor/distributor.guard';

@Controller('distributor/orders')
@UseGuards(AuthGuard, DistributorGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Put(':orderId')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() { status }: { status: string },
  ): Promise<{ status: string }> {
    try {
      const updatedOrder = await this.ordersService.updateOrderStatus(orderId, status);
      return { status: updatedOrder.status };
    } catch (error) {
      if (error.message === 'order not found') {
        throw new Error('Order not found');
      } else if (error.message === 'invalid status') {
        throw new Error('Invalid status');
      } else {
        console.error('Error updating order status:', error);
        throw new Error('Failed to update order status');
      }
    }
  }
}