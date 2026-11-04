import { Injectable, NotFoundException } from '@nestjs/common';
import { Mod023Service } from 'MOD-023'; // Assuming MOD-023 is the shipping provider module
import { Shipment } from './shipments.model';

@Injectable()
export class ShipmentsService {
  constructor(private readonly mod023Service: Mod023Service) {}

  async getShipmentByOrderId(orderId: string): Promise<{ status: string; tracking_number: string }> {
    try {
      // Retrieve shipment details from the database using the order ID.
      const shipment: Shipment = await this.mod023Service.getShipmentDetails(orderId);

      if (!shipment) {
        throw new NotFoundException('Order not found');
      }

      // Handle shipment exceptions and delays.  This would typically involve
      // checking external shipping provider data for status updates.
      let status = shipment.status;
      let trackingNumber = shipment.tracking_number;

      // Simulate handling exceptions - replace with real logic.
      if (shipment.status === 'in_transit' && shipment.estimated_delivery_delay > 0) {
        status = 'delayed';
      } else if (shipment.status === 'lost') {
        status = 'lost';
        // Additional handling for lost packages (e.g., logging, notifications).
      }

      return {
        status: status,
        tracking_number: trackingNumber,
      };
    } catch (error) {
      // Gracefully handle API errors from shipping providers.
      console.error('Error retrieving shipment details:', error);
      
      // Re-throw or return a more user-friendly error message as appropriate.
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the NotFoundException
      }
      
      throw new NotFoundException('Failed to retrieve shipment information.');
    }
  }
}