import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity } from '../redux/cartSlice';

function CartPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="mt-8">
            <p className="text-slate-600">Your cart is empty.</p>
            <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {cartItems.map((item) => (
              <div key={item._id} className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div>
                    <h2 className="font-semibold text-slate-800">{item.name}</h2>
                    <p className="text-sm text-slate-500">${item.price} each</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-600">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                      dispatch(
                        updateQuantity({
                          id: item._id,
                          quantity: Number(event.target.value),
                        })
                      )
                    }
                    className="w-16 rounded-md border border-slate-300 px-2 py-1 text-center"
                  />
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-slate-700">Subtotal</span>
            <span className="text-xl font-bold text-slate-900">${subtotal.toFixed(2)}</span>
          </div>

          <div className="mt-6 flex gap-3">
            <Link to="/" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Continue Shopping
            </Link>
            <Link
              to="/checkout"
              className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
