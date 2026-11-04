import React, { useState, useEffect } from 'react';
import orderApi from '../api/orderApi'; // Assuming MOD-025
import { useCart } from '../../context/CartContext'; // Assuming MOD-022
import { useRateLimit } from '../hooks/useRateLimit';

const Checkout = () => {
    const { cartItems, clearCart } = useCart();
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('credit_card'); // Example
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const rateLimit = useRateLimit({ interval: 5000 }); // 5 seconds rate limit

    const handleAddressChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const placeOrder = async () => {
        if (!rateLimit()) {
            setErrorMessage('Too many requests. Please try again later.');
            return;
        }

        // Validate order data
        if (!isValidOrderData(cartItems, shippingAddress, paymentMethod)) {
            setErrorMessage('Please fill in all required fields and ensure your cart is not empty.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            // Encrypt sensitive payment information before sending
            const encryptedPaymentInfo = encryptPaymentInfo(paymentMethod);

            const orderData = {
                items: cartItems,
                paymentMethod: encryptedPaymentInfo,
                shippingAddress: shippingAddress,
            };

            const response = await orderApi.createOrder(orderData);

            if (response.status === 201) {
                const orderId = response.body.orderId;
                console.log('Order placed successfully. Order ID:', orderId);
                clearCart();
                setErrorMessage(`Order placed successfully! Order ID: ${orderId}`);
            } else {
                setErrorMessage('Order placement failed.');
            }

        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessage('Invalid order details. Please check your information.');
            } else if (error.response && error.response.status === 500) {
                setErrorMessage('Payment processing error. Please try again.');
            } else {
                setErrorMessage('An unexpected error occurred.');
                console.error('Error placing order:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const isValidOrderData = (items, address, payment) => {
        return items && items.length > 0 && address && Object.values(address).every(value => value.trim() !== '') && payment;
    };

    // Mock Encryption Function - Replace with actual encryption logic
    const encryptPaymentInfo = (paymentMethod) => {
        // In a real application, use a secure encryption library here.
        // NEVER log or store raw payment information.
        // console.log("Encrypting payment method:", paymentMethod); //DO NOT LOG SENSITIVE DATA
        return `ENCRYPTED_${paymentMethod}`;
    };

    return (
        <div>
            <h2>Checkout</h2>
            <form>
                <div>
                    <label>
                        Shipping Address:
                        <input type="text" name="street" value={shippingAddress.street} onChange={handleAddressChange} placeholder="Street" />
                    </label>
                </div>
                <div>
                    <label>
                        City:
                        <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} placeholder="City" />
                    </label>
                </div>
                <div>
                    <label>
                        State:
                        <input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange} placeholder="State" />
                    </label>
                </div>
                <div>
                    <label>
                        Zip Code:
                        <input type="text" name="zip" value={shippingAddress.zip} onChange={handleAddressChange} placeholder="Zip Code" />
                    </label>
                </div>
                <div>
                    <label>
                        Payment Method:
                        <select value={paymentMethod} onChange={handlePaymentMethodChange}>
                            <option value="credit_card">Credit Card</option>
                            {/* Add other payment methods as needed */}
                        </select>
                    </label>
                </div>
                <button type="button" onClick={placeOrder} disabled={loading}>
                    {loading ? 'Placing Order...' : 'Place Order'}
                </button>
            </form>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default Checkout;