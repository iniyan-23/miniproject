import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const initialForm = {
  name: '',
  image: '',
  description: '',
  price: '',
  countInStock: '',
};

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const userInfo = useSelector((state) => state.auth.userInfo);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    if (!userInfo.isAdmin) {
      navigate('/');
      return;
    }

    const fetchProducts = async () => {
      try {
        const { data } = await API.get('/admin/products');
        setProducts(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, userInfo]);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await API.post('/admin/products', {
        ...formData,
        price: Number(formData.price),
        countInStock: Number(formData.countInStock),
      });

      const { data } = await API.get('/admin/products');
      setProducts(data);
      setFormData(initialForm);
      setSuccess('Product created successfully');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create product');
      setSuccess('');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/products/${id}`);
      setProducts((currentProducts) => currentProducts.filter((product) => product._id !== id));
      setSuccess('Product deleted');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete product');
      setSuccess('');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading admin dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">Manage products and order activity.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Add Product</h2>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{success}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Image URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Stock</label>
                <input
                  type="number"
                  name="countInStock"
                  value={formData.countInStock}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Save Product
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Product Inventory</h2>

          <div className="mt-6 space-y-4">
            {products.map((product) => (
              <div key={product._id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  <img src={product.image} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />
                  <div>
                    <p className="font-semibold text-slate-800">{product.name}</p>
                    <p className="text-sm text-slate-500">${product.price}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">Stock</p>
                  <p className="font-semibold text-slate-800">{product.countInStock}</p>
                  <button
                    type="button"
                    onClick={() => handleDelete(product._id)}
                    className="mt-2 text-xs font-medium text-red-600 underline underline-offset-4"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
