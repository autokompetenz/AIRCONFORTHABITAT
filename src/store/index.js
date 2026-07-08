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
