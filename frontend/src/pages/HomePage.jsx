import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import API from '../services/api';
import { addToCart } from '../redux/cartSlice';
import { logout } from '../redux/authSlice';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get('/products');
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading products...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            ShopSphere
          </p>
          <h1 className="mt-2 text-3xl font-bold">Featured Products</h1>
        </div>
        <Link
          to="/cart"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Cart ({cartItems.reduce((total, item) => total + item.quantity, 0)})
        </Link>
        <Link to="/orders" className="text-sm font-medium text-indigo-600 hover:underline">
          My Orders
        </Link>
        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="text-sm font-medium text-slate-600 hover:text-red-600"
        >
          Logout
        </button>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product._id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <img src={product.image} alt={product.name} className="h-56 w-full object-cover" />
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-800">{product.name}</h2>
                <span className="text-xl font-bold text-indigo-600">${product.price}</span>
              </div>

              <p className="mb-4 line-clamp-3 text-sm text-slate-600">{product.description}</p>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                </span>
                <button
                  onClick={() => dispatch(addToCart(product))}
                  className="rounded-full bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  Add to cart
                </button>
              </div>

              <Link
                to={`/product/${product._id}`}
                className="mt-3 inline-block text-sm font-medium text-slate-700 underline underline-offset-4"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default HomePage;
