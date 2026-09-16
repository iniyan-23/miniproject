import { createSlice } from '@reduxjs/toolkit';

const CART_STORAGE_KEY = 'cartItems';

const persistCart = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Persistence is best-effort when browser storage is unavailable.
  }
};

const getInitialCart = () => {
  try {
    const serializedCart = localStorage.getItem(CART_STORAGE_KEY);
    const storedCart = serializedCart ? JSON.parse(serializedCart) : [];

    if (!Array.isArray(storedCart)) {
      return [];
    }

    return storedCart.filter(
      (item) => item && item._id && Number.isFinite(item.price) && Number.isInteger(item.quantity) && item.quantity > 0,
    );
  } catch {
    return [];
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getInitialCart(),
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find((cartItem) => cartItem._id === item._id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }

      persistCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      persistCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((cartItem) => cartItem._id === id);

      if (item) {
        const nextQuantity = Number(quantity);
        item.quantity = Number.isInteger(nextQuantity) && nextQuantity > 0 ? nextQuantity : 1;
      }

      persistCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      persistCart(state.items);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
