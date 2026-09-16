import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import API from '../services/api';
import { addToCart } from '../redux/cartSlice';

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Product not found</h1>
          <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/" className="mb-6 inline-block text-sm font-medium text-indigo-600 hover:underline">
        ← Back to products
      </Link>

      <div className="grid gap-8 overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:grid-cols-2">
        <img src={product.image} alt={product.name} className="h-[420px] w-full rounded-2xl object-cover" />

        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            Premium tech
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-slate-900">${product.price}</p>

          <p className="mt-5 text-base text-slate-600">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              {product.countInStock > 0 ? 'In stock' : 'Sold out'}
            </span>
            <span className="text-sm text-slate-500">{product.countInStock} available</span>
          </div>

          <button
            onClick={() => dispatch(addToCart(product))}
            className="mt-8 rounded-full bg-slate-900 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
