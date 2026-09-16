import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import products from './data/products.js';

dotenv.config();

const seedProducts = async () => {
  try {
    await connectDB();

    for (const product of products) {
      await Product.findOneAndUpdate(
        { name: product.name },
        product,
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
      );
    }

    console.log(`${products.length} products are ready.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error(`Product seeding failed: ${error.message}`);
    await mongoose.disconnect();
    process.exitCode = 1;
  }
};

seedProducts();
