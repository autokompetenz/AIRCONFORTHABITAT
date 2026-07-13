import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ach_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const productAPI = {
  getAll:        (p)    => api.get('/products', { params: p }),
  getById:       (id)   => api.get(`/products/${id}`),
  getTypes:      ()     => api.get('/products/types'),
  getBrands:     ()     => api.get('/products/brands'),
};

export const orderAPI = {
  create:  (d) => api.post('/orders', d),
  track:   (num) => api.get(`/orders/track/${num}`),
  uploadPaymentProof:  (orderNumber, fd) => api.post(`/orders/upload-payment-proof/${orderNumber}`, fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }),
};

export const adminAPI = {
  login:           (code) => api.post('/admin/login', { code }),
  stats:           ()     => api.get('/admin/stats'),
  products:        ()     => api.get('/admin/products'),
  getProductById:  (id)   => api.get(`/admin/products/${id}`),
  createProduct:   (fd)   => api.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }),
  updateProduct:   (id,fd) => api.put(`/admin/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }),
  toggleProduct:   (id)   => api.patch(`/admin/products/${id}/toggle`),
  deleteProduct:   (id)   => api.delete(`/admin/products/${id}`),
  orders:          (p)    => api.get('/admin/orders', { params: p }),
  orderById:       (id)   => api.get(`/admin/orders/${id}`),
  updateOrder:     (id,d) => api.patch(`/admin/orders/${id}`, d),
  deleteOrder:     (id)   => api.delete(`/admin/orders/${id}`),
  replyToCustomer: (id,m) => api.post(`/admin/orders/${id}/reply`, m),
  customers:       ()     => api.get('/admin/customers'),
  stockAlerts:     ()     => api.get('/admin/stock-alerts'),
  newsletters:     ()     => api.get('/admin/newsletters'),
  newsletterById:  (id)   => api.get(`/admin/newsletters/${id}`),
  sendNewsletter:  (data) => api.post('/admin/newsletters', data),
  deleteNewsletter: (id)  => api.delete(`/admin/newsletters/${id}`),
  randomProduct:   ()     => api.get('/admin/random-product'),
};

export default api;
