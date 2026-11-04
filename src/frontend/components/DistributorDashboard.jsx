import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const DistributorDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
    const [fulfillmentDetails, setFulfillmentDetails] = useState({
        trackingNumber: '',
        shippingDate: '',
    });

    useEffect(() => {
        // Mock data for demonstration purposes
        const mockOrders = [
            { id: 1, orderDate: '2024-01-20', status: 'Pending', totalAmount: 100 },
            { id: 2, orderDate: '2024-01-25', status: 'Shipped', totalAmount: 150 },
            { id: 3, orderDate: '2024-02-01', status: 'Pending', totalAmount: 75 },
        ];
        setOrders(mockOrders);
    }, []);

    const handleFulfillOrder = (orderId) => {
        setSelectedOrder(orderId);
        setShowFulfillmentModal(true);
    };

    const handleCancelOrder = (orderId) => {
        // Implement cancellation logic here
        console.log('Cancelling order:', orderId);
        // You might want to add a confirmation dialog before canceling
    };

    const handleFulfillmentSubmit = () => {
        // Validate fulfillment details (e.g., tracking number, shipping date)
        if (!fulfillmentDetails.trackingNumber || !fulfillmentDetails.shippingDate) {
            alert('Please provide both tracking number and shipping date.');
            return;
        }

        // Update order status and shipping information (mock for now)
        const updatedOrders = orders.map((order) => {
            if (order.id === selectedOrder) {
                return {
                    ...order,
                    status: 'Shipped',
                    trackingNumber: fulfillmentDetails.trackingNumber,
                    shippingDate: fulfillmentDetails.shippingDate,
                };
            }
            return order;
        });
        setOrders(updatedOrders);
        setShowFulfillmentModal(false);

        // Notify distributor of order fulfillment (replace with actual notification logic)
        alert(`Order ${selectedOrder} fulfilled successfully!`);
    };

    return (
        <div>
            <h2>Distributor Dashboard</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Order Date</th>
                        <th>Status</th>
                        <th>Total Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.orderDate}</td>
                            <td>{order.status}</td>
                            <td>{order.totalAmount}</td>
                            <td>
                                {order.status === 'Pending' ? (
                                    <>
                                        <Button variant="primary" onClick={() => handleFulfillOrder(order.id)}>
                                            Fulfill Order
                                        </Button>
                                        <Button variant="danger" onClick={() => handleCancelOrder(order.id)}>
                                            Cancel Order
                                        </Button>
                                    </>
                                ) : (
                                    <p>Shipped - Tracking: {order.trackingNumber}</p>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showFulfillmentModal} onHide={() => setShowFulfillmentModal(false)}>
                <Modal.Header>
                    <Modal.Title>Fulfill Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="trackingNumber">
                            <Form.Label>Tracking Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={fulfillmentDetails.trackingNumber}
                                onChange={(e) => setFulfillmentDetails({ ...fulfillmentDetails, trackingNumber: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="shippingDate">
                            <Form.Label>Shipping Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={fulfillmentDetails.shippingDate}
                                onChange={(e) => setFulfillmentDetails({ ...fulfillmentDetails, shippingDate: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFulfillmentModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleFulfillmentSubmit}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default DistributorDashboard;