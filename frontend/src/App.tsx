
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { ProductsList } from './pages/products/ProductsList';
import { ProductCreate } from './pages/products/ProductCreate';
import { ProductDetail } from './pages/products/ProductDetail';
import { CategoriesList } from './pages/categories/CategoriesList';
import { CategoryCreate } from './pages/categories/CategoryCreate';
import { CustomersList } from './pages/customers/CustomersList';
import { CustomerCreate } from './pages/customers/CustomerCreate';
import { CustomerDetail } from './pages/customers/CustomerDetail';
import { OrdersList } from './pages/orders/OrdersList';
import { OrderCreate } from './pages/orders/OrderCreate';
import { OrderDetail } from './pages/orders/OrderDetail';
import { Shop } from './pages/shop/Shop';
import { Cart } from './pages/cart/Cart';
import { CartProvider } from './store/CartContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="shop" element={<Shop />} />
            <Route path="cart" element={<Cart />} />
            
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductCreate />} />
            <Route path="products/:id" element={<ProductDetail />} />
            
            <Route path="categories" element={<CategoriesList />} />
            <Route path="categories/new" element={<CategoryCreate />} />
            
            <Route path="customers" element={<CustomersList />} />
            <Route path="customers/new" element={<CustomerCreate />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/new" element={<OrderCreate />} />
            <Route path="orders/:id" element={<OrderDetail />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
