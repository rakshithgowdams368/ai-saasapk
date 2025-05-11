// lib/paypal/client.ts
import axios from 'axios';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

class PayPalClient {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  // Get access token
  private async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    try {
      const response = await axios.post(
        `${PAYPAL_API_BASE}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
      return this.accessToken;
    } catch (error) {
      console.error('PayPal access token error:', error);
      throw error;
    }
  }

  // Create order
  async createOrder(amount: number, currency = 'USD') {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${PAYPAL_API_BASE}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount.toFixed(2),
              },
              description: 'NexusAI Subscription',
            },
          ],
          application_context: {
            brand_name: 'NexusAI',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/capture-order`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('PayPal create order error:', error);
      throw error;
    }
  }

  // Capture order
  async captureOrder(orderId: string) {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('PayPal capture order error:', error);
      throw error;
    }
  }

  // Get order details
  async getOrderDetails(orderId: string) {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('PayPal get order error:', error);
      throw error;
    }
  }

  // Refund payment
  async refundPayment(captureId: string, amount?: number) {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`,
        amount ? { amount: { value: amount.toFixed(2), currency_code: 'USD' } } : {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('PayPal refund error:', error);
      throw error;
    }
  }
}

export const paypalClient = new PayPalClient();