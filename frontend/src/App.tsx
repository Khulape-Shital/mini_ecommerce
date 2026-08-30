
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
import { OrdersList } from './pages/orders/OrdersList';
import { OrderCreate } from './pages/orders/OrderCreate';
import { OrderDetail } from './pages/orders/OrderDetail';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductCreate />} />
            <Route path="products/:id" element={<ProductDetail />} />
            
            <Route path="categories" element={<CategoriesList />} />
            <Route path="categories/new" element={<CategoryCreate />} />
            
            <Route path="customers" element={<CustomersList />} />
            <Route path="customers/new" element={<CustomerCreate />} />
            
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/new" element={<OrderCreate />} />
            <Route path="orders/:id" element={<OrderDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
