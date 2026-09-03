const fs = require('fs');
const path = require('path');

const filesToUpdateBrand = [
  'src/layouts/MainLayout.tsx',
  'src/pages/Dashboard.tsx',
  'src/store/CartContext.tsx'
];

const filesToUpdateCurrency = [
  'src/pages/shop/Shop.tsx',
  'src/pages/products/ProductsList.tsx',
  'src/pages/products/ProductDetail.tsx',
  'src/pages/products/ProductCreate.tsx',
  'src/pages/orders/OrdersList.tsx',
  'src/pages/orders/OrderDetail.tsx',
  'src/pages/orders/OrderCreate.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/customers/CustomersList.tsx',
  'src/pages/cart/Cart.tsx',
  'src/components/MessageAlert.tsx',
  'src/api/product.ts',
  'src/api/order.ts',
  'src/api/customer.ts'
];

function replaceInFile(filePath, searchRegex, replaceWith) {
  const fullPath = path.join(__dirname, 'frontend', filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  content = content.replace(searchRegex, replaceWith);
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Brand name update
filesToUpdateBrand.forEach(file => {
  replaceInFile(file, /Nexus/g, 'Shopora');
});

// Currency formatting
filesToUpdateCurrency.forEach(file => {
  replaceInFile(file, /\$/g, '₹');
});

// Update index.css for light theme
const indexCssPath = path.join(__dirname, 'frontend', 'src', 'index.css');
if (fs.existsSync(indexCssPath)) {
  let cssContent = fs.readFileSync(indexCssPath, 'utf8');
  
  // Remove dark mode media query completely
  cssContent = cssContent.replace(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{[\s\S]*?\}\n\}\n/g, '');
  
  // Replace the glass-panel setup
  const glassPanelLight = `.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}`;

  cssContent = cssContent.replace(/\.glass-panel\s*\{[\s\S]*?\}\n@media\s*\(prefers-color-scheme:\s*light\)\s*\{[\s\S]*?\}\n\}\n/g, glassPanelLight + '\n');
  
  fs.writeFileSync(indexCssPath, cssContent, 'utf8');
  console.log('Updated: src/index.css');
}

console.log('Done');
