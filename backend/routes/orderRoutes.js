import express from 'express';
const router = express.Router();
import Order from '../models/Order.js';
import { protect } from '../middleware/authMiddleware.js';

// @desc    Create new order
// @route   POST /api/orders
router.post('/', protect, async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
router.get('/myorders', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Track one logged-in user's order
// @route   GET /api/orders/:id/track
router.get('/:id/track', protect, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({
    _id: order._id,
    status: order.status || 'Processing',
    trackingNumber: order.trackingNumber,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt,
    createdAt: order.createdAt,
  });
});

// @desc    Update shipping address for an order
// @route   PUT /api/orders/:id/address
router.put('/:id/address', protect, async (req, res) => {
  const { address, city, postalCode, country } = req.body;
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status === 'Shipped' || order.status === 'Out for delivery' || order.status === 'Delivered' || order.status === 'Cancelled') {
    res.status(400);
    throw new Error('This order address can no longer be edited');
  }

  if (!address || !city || !postalCode || !country) {
    res.status(400);
    throw new Error('Please provide a complete shipping address');
  }

  order.shippingAddress = { address, city, postalCode, country };
  res.json(await order.save());
});

// @desc    Cancel a logged-in user's order
// @route   PUT /api/orders/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.status !== 'Processing') {
    res.status(400);
    throw new Error('Only processing orders can be cancelled');
  }

  order.status = 'Cancelled';
  order.cancelledAt = new Date();
  res.json(await order.save());
});

export default router;
