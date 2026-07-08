import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { useThemeStore, useLangStore } from './store';
import Toast from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ClientBottomNav from './components/ClientBottomNav';
import MailButton from './components/MailButton';
import DeliveryModal from './components/DeliveryModal';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Track from './pages/Track';
import Legal from './pages/Legal';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminStockAlerts from './pages/admin/AdminStockAlerts';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <ClientBottomNav />
      <MailButton />
      <DeliveryModal />
      <Toast />
    </>
  );
}

function PublicRoute({ element }) {
  return <PublicLayout>{element}</PublicLayout>;
}

export default function App() {
  const { theme } = useThemeStore();
  const { lang } = useLangStore();

  useEffect(() => {
    document.documentElement.lang = lang || 'fr';
  }, [lang]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PublicRoute element={<Home />} />} />
        <Route path="/catalog" element={<PublicRoute element={<Catalog />} />} />
        <Route path="/product/:slug" element={<PublicRoute element={<ProductDetails />} />} />
        <Route path="/track" element={<PublicRoute element={<Track />} />} />
        <Route path="/track/:number" element={<PublicRoute element={<Track />} />} />
        <Route path="/legal" element={<PublicRoute element={<Legal />} />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="stock-alerts" element={<AdminStockAlerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
