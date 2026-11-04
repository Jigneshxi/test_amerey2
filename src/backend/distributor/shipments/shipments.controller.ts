import { Controller, Get, Param, NotFoundException, HttpStatus, Res, Header } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { Encrypt } from 'MOD-023'; // Assuming Encrypt is exported from MOD-023

@Controller('distributor/shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get(':orderId')
  @Header('Content-Type', 'application/json')
  async getShipment(@Param('orderId') orderId: string, @Res() response: any): Promise<any> {
    try {
      const shipment = await this.shipmentsService.getShipmentByOrderId(orderId);

      if (!shipment) {
        throw new NotFoundException('Order not found');
      }

      // Encrypt sensitive data before sending the response.
      const encryptedTrackingNumber = Encrypt.encryptData(shipment.tracking_number);

      const responseData = {
        status: shipment.status,
        tracking_number: encryptedTrackingNumber, // Return encrypted tracking number
      };
      
      return response.status(HttpStatus.OK).json(responseData);

    } catch (error) {
      if (error instanceof NotFoundException) {
        return response.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      }

      // Handle exceptions like lost packages or delays
      if (error.message.includes('Lost Package') || error.message.includes('Delay')) {
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Shipment exception occurred. Please contact support.',
          error: error.message,
        });
      }
      
      //Gracefully handle API errors from shipping providers
      if (error.message.includes('Shipping Provider Error')){
          return response.status(HttpStatus.BAD_GATEWAY).json({
              message: 'Error communicating with shipping provider',
              error: error.message
          });
      }
      

      console.error('Error fetching shipment:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
  }
}