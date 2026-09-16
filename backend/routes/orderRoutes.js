import express from 'express';
const router = express.Router();
import Order from '../models/Order.js';
import Product from '../models/Product.js';
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

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const quantityByProduct = new Map();
  for (const item of orderItems) {
    const quantity = Number(item.qty);

    if (!item.product || !Number.isInteger(quantity) || quantity < 1) {
      res.status(400);
      throw new Error('Invalid order item');
    }

    quantityByProduct.set(
      item.product,
      (quantityByProduct.get(item.product) || 0) + quantity,
    );
  }

  const updatedProducts = [];

  try {
    for (const [productId, quantity] of quantityByProduct) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, countInStock: { $gte: quantity } },
        { $inc: { countInStock: -quantity } },
        { returnDocument: 'after' },
      );

      if (!product) {
        res.status(400);
        throw new Error('One or more products do not have enough stock');
      }

      updatedProducts.push({ productId, quantity });
    }

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
  } catch (error) {
    for (const { productId, quantity } of updatedProducts) {
      await Product.findByIdAndUpdate(productId, { $inc: { countInStock: quantity } });
    }

    throw error;
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

  const currentStatus = order.status || 'Processing';

  if (currentStatus !== 'Processing') {
    res.status(400);
    throw new Error('Only processing orders can be cancelled');
  }

  order.status = 'Cancelled';
  order.cancelledAt = new Date();

  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: item.qty } });
  }

  res.json(await order.save());
});

export default router;
