import { create } from 'zustand';

const savedTheme = localStorage.getItem('ach_theme') || 'light';
if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
else document.documentElement.removeAttribute('data-theme');

export const useThemeStore = create((set) => ({
  theme: savedTheme,
  toggle: () => {
    set((s) => {
      const newTheme = s.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('ach_theme', newTheme);
      if (newTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
      return { theme: newTheme };
    });
  },
}));

export const useLangStore = create((set) => ({
  lang: localStorage.getItem('ach_lang') || 'fr',
  setLang: (lang) => {
    localStorage.setItem('ach_lang', lang);
    document.documentElement.lang = lang;
    set({ lang });
  },
}));

export const useAdminStore = create((set, get) => ({
  token: localStorage.getItem('ach_admin_token') || null,
  isAuthenticated: !!localStorage.getItem('ach_admin_token'),

  login: (token) => {
    localStorage.setItem('ach_admin_token', token);
    set({ token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('ach_admin_token');
    set({ token: null, isAuthenticated: false });
  },
}));

let toastId = 0;
export const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (message, type = 'success', duration = 3800) => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => set({ toasts: get().toasts.filter(t => t.id !== id) }), duration);
    return id;
  },
  removeToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),
}));

const savedCart = (() => {
  try { return JSON.parse(localStorage.getItem('ach_cart')) || []; } catch { return []; }
})();

export const useCartStore = create((set, get) => ({
  items: savedCart,
  cartOpen: false,

  toggleCart: () => set(s => ({ cartOpen: !s.cartOpen })),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),

  addItem: (product, quantity = 1) => {
    const items = [...get().items];
    const idx = items.findIndex(i => i.id === product.id);
    if (idx >= 0) {
      items[idx].quantity += quantity;
    } else {
      items.push({ id: product.id, slug: product.slug, name: product.name, brand: product.brand, imageUrl: product.imageUrl, price: product.salePrice || product.price, quantity });
    }
    localStorage.setItem('ach_cart', JSON.stringify(items));
    set({ items });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    const items = get().items.map(i => i.id === productId ? { ...i, quantity } : i);
    localStorage.setItem('ach_cart', JSON.stringify(items));
    set({ items });
  },

  removeItem: (productId) => {
    const items = get().items.filter(i => i.id !== productId);
    localStorage.setItem('ach_cart', JSON.stringify(items));
    if (items.length === 0) set({ items, cartOpen: false });
    else set({ items });
  },

  clearCart: () => {
    localStorage.removeItem('ach_cart');
    set({ items: [], cartOpen: false });
  },

  get total() {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  get count() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));
