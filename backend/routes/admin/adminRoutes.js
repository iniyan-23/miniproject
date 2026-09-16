import express from 'express';
const router = express.Router();
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

// @desc    Get all products for admin
// @route   GET /api/admin/products
router.get('/products', protect, admin, async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc    Create product
// @route   POST /api/admin/products
router.post('/products', protect, admin, async (req, res) => {
  const { name, image, description, price, countInStock } = req.body;

  if (!name || !description || !image || !price || countInStock === undefined) {
    res.status(400);
    throw new Error('Please provide all product fields');
  }

  const product = new Product({
    name,
    image,
    description,
    price,
    countInStock,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
router.put('/products/:id', protect, admin, async (req, res) => {
  const { name, image, description, price, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.image = image || product.image;
    product.description = description || product.description;
    product.price = price || product.price;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
router.delete('/products/:id', protect, admin, async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get all orders
// @route   GET /api/admin/orders
router.get('/orders', protect, admin, async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

export default router;
