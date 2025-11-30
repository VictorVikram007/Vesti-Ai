const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock Masumi API configuration
const MASUMI_CONFIG = {
  apiKey: process.env.MASUMI_API_KEY || 'masumi_test_key',
  baseUrl: 'https://api.masumi.io/v1',
  webhookSecret: process.env.MASUMI_WEBHOOK_SECRET || 'webhook_secret'
};

// Store payment sessions (in production, use a database)
const paymentSessions = new Map();

// Initiate Masumi Payment
app.post('/api/masumi/initiate-payment', async (req, res) => {
  try {
    const { items, totalINR, currency, customerEmail } = req.body;
    
    console.log('=== Masumi Payment Initiation ===');
    console.log('Items:', items);
    console.log('Total INR:', totalINR);
    console.log('Currency:', currency);
    console.log('Customer:', customerEmail);
    
    // Convert INR to ADA (mock conversion rate: 1 ADA = 85 INR)
    const adaAmount = Math.round((totalINR / 85) * 1000000) / 1000000; // 6 decimal places
    
    // Create payment session with Masumi API
    const masumiPayload = {
      amount: adaAmount,
      currency: currency || 'ADA',
      description: `Vesti AI Purchase - ${items.length} items`,
      customer: {
        email: customerEmail,
        metadata: {
          items: JSON.stringify(items),
          totalINR: totalINR
        }
      },
      expiresIn: 900, // 15 minutes
      callbackUrl: `${req.protocol}://${req.get('host')}/api/masumi/webhook`,
      successUrl: `${req.protocol}://${req.get('host')}/checkout?status=success`,
      cancelUrl: `${req.protocol}://${req.get('host')}/checkout?status=cancelled`
    };
    
    // Mock Masumi API call (replace with actual Masumi SDK)
    const mockMasumiResponse = {
      paymentId: `masumi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      walletAddress: generateMockCardanoAddress(),
      amount: adaAmount,
      currency: currency || 'ADA',
      qrCode: `cardano:${generateMockCardanoAddress()}?amount=${adaAmount}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: 'pending'
    };
    
    // Store payment session
    paymentSessions.set(mockMasumiResponse.paymentId, {
      ...mockMasumiResponse,
      items,
      totalINR,
      customerEmail,
      createdAt: new Date().toISOString()
    });
    
    console.log('Payment session created:', mockMasumiResponse.paymentId);
    
    res.json(mockMasumiResponse);
    
  } catch (error) {
    console.error('Masumi payment initiation error:', error);
    res.status(500).json({
      error: 'Payment initiation failed',
      message: error.message
    });
  }
});

// Check Payment Status
app.get('/api/masumi/payment-status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const session = paymentSessions.get(paymentId);
    if (!session) {
      return res.status(404).json({ error: 'Payment session not found' });
    }
    
    // Mock payment completion after 30 seconds (for demo)
    const createdAt = new Date(session.createdAt).getTime();
    const now = Date.now();
    const elapsed = now - createdAt;
    
    let status = 'pending';
    if (elapsed > 30000) { // 30 seconds for demo
      status = 'completed';
      session.status = 'completed';
      session.completedAt = new Date().toISOString();
      session.transactionHash = `tx_${Math.random().toString(36).substr(2, 16)}`;
    }
    
    console.log(`Payment status check: ${paymentId} - ${status}`);
    
    res.json({
      paymentId,
      status,
      amount: session.amount,
      currency: session.currency,
      transactionHash: session.transactionHash || null,
      completedAt: session.completedAt || null
    });
    
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: error.message
    });
  }
});

// Masumi Webhook Handler
app.post('/api/masumi/webhook', (req, res) => {
  try {
    const { paymentId, status, transactionHash, amount, currency } = req.body;
    
    console.log('=== Masumi Webhook Received ===');
    console.log('Payment ID:', paymentId);
    console.log('Status:', status);
    console.log('Transaction Hash:', transactionHash);
    console.log('Amount:', amount, currency);
    
    const session = paymentSessions.get(paymentId);
    if (!session) {
      return res.status(404).json({ error: 'Payment session not found' });
    }
    
    // Update payment session
    session.status = status;
    session.transactionHash = transactionHash;
    session.completedAt = new Date().toISOString();
    
    if (status === 'completed') {
      // Process successful payment
      console.log('Payment completed successfully!');
      console.log('Unlocking services for customer:', session.customerEmail);
      console.log('Items purchased:', session.items);
      
      // Here you would:
      // 1. Update user subscription/services
      // 2. Send confirmation email
      // 3. Unlock premium features
      // 4. Generate receipts
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

// Get Payment History
app.get('/api/masumi/payments', (req, res) => {
  try {
    const payments = Array.from(paymentSessions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10); // Last 10 payments
    
    res.json(payments);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      error: 'Failed to fetch payment history',
      message: error.message
    });
  }
});

// Helper function to generate mock Cardano address
function generateMockCardanoAddress() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let address = 'addr1q';
  for (let i = 0; i < 98; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

// Health check
app.get('/api/masumi/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Masumi Integration API is running',
    activeSessions: paymentSessions.size
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Masumi Integration API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/masumi/health`);
  console.log(`Payment endpoint: http://localhost:${PORT}/api/masumi/initiate-payment`);
});

module.exports = app;