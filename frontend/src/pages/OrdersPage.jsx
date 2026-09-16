import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { logout } from '../redux/authSlice';

const emptyAddress = {
  address: '',
  city: '',
  postalCode: '',
  country: '',
};

const getStatusStyle = (status) => {
  if (status === 'Cancelled') return 'bg-red-100 text-red-700';
  if (status === 'Delivered') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Shipped' || status === 'Out for delivery') return 'bg-blue-100 text-blue-700';
  return 'bg-amber-100 text-amber-700';
};

function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [address, setAddress] = useState(emptyAddress);
  const [tracking, setTracking] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/myorders');
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      try {
        const { data } = await API.get('/orders/myorders');
        if (isActive) {
          setOrders(data);
          setError('');
        }
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.message || 'Unable to load your orders');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isActive = false;
    };
  }, []);

  const handleCancel = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/cancel`);
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel this order');
    }
  };

  const startAddressEdit = (order) => {
    setEditingOrderId(order._id);
    setAddress(order.shippingAddress);
    setError('');
  };

  const handleAddressChange = (event) => {
    setAddress((currentAddress) => ({
      ...currentAddress,
      [event.target.name]: event.target.value,
    }));
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    setSavingAddress(true);

    try {
      await API.put(`/orders/${editingOrderId}/address`, address);
      setEditingOrderId(null);
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update the address');
    } finally {
      setSavingAddress(false);
    }
  };

  const trackOrder = async (orderId) => {
    try {
      const { data } = await API.get(`/orders/${orderId}/track`);
      setTracking(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to track this order');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading your orders...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">ShopSphere</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">My Orders</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-indigo-600 hover:underline">Back to products</Link>
          <button
            type="button"
            onClick={() => {
              dispatch(logout());
              navigate('/login');
            }}
            className="text-sm font-medium text-slate-600 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {error && <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {orders.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">No orders yet</h2>
          <p className="mt-2 text-slate-600">Your completed purchases will appear here.</p>
          <Link to="/" className="mt-6 inline-block rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = order.status || (order.isDelivered ? 'Delivered' : 'Processing');
            const canEdit = status === 'Processing';

            return (
              <article key={order._id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <p className="text-sm text-slate-500">Order placed {new Date(order.createdAt).toLocaleDateString()}</p>
                    <h2 className="mt-1 font-semibold text-slate-900">Order #{order._id.slice(-8).toUpperCase()}</h2>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(status)}`}>{status}</span>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_280px]">
                  <div>
                    <h3 className="font-semibold text-slate-900">Ordered products</h3>
                    <div className="mt-3 space-y-3">
                      {order.orderItems.map((item) => (
                        <div key={item.product} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-800">{item.name}</p>
                              <p className="text-sm text-slate-500">Qty: {item.qty} × ${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-slate-800">${(item.qty * item.price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900">Delivery details</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                      {order.shippingAddress.country}
                    </p>
                    <p className="mt-4 text-lg font-bold text-slate-900">Total: ${order.totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
                  <button type="button" onClick={() => trackOrder(order._id)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Track order</button>
                  {canEdit && <button type="button" onClick={() => startAddressEdit(order)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit address</button>}
                  {canEdit && <button type="button" onClick={() => handleCancel(order._id)} className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Cancel order</button>}
                </div>

                {editingOrderId === order._id && (
                  <form onSubmit={saveAddress} className="mt-5 grid gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 md:grid-cols-2">
                    {Object.keys(emptyAddress).map((field) => (
                      <input
                        key={field}
                        required
                        name={field}
                        value={address[field]}
                        onChange={handleAddressChange}
                        placeholder={field === 'postalCode' ? 'Postal code' : field[0].toUpperCase() + field.slice(1)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500"
                      />
                    ))}
                    <div className="flex gap-3 md:col-span-2">
                      <button type="submit" disabled={savingAddress} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:bg-indigo-300">{savingAddress ? 'Saving...' : 'Save address'}</button>
                      <button type="button" onClick={() => setEditingOrderId(null)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Close</button>
                    </div>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      )}

      {tracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.15em] text-indigo-600">Order tracking</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{tracking.status}</h2>
              </div>
              <button type="button" onClick={() => setTracking(null)} className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close tracking">×</button>
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <p>Order placed: {new Date(tracking.createdAt).toLocaleString()}</p>
              <p>Tracking number: {tracking.trackingNumber || 'Tracking number will be added when shipped.'}</p>
              {tracking.deliveredAt && <p>Delivered: {new Date(tracking.deliveredAt).toLocaleString()}</p>}
            </div>
            <button type="button" onClick={() => setTracking(null)} className="mt-6 w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
