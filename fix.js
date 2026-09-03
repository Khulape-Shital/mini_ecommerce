const fs = require('fs');
const path = require('path');

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

// Fix template literals broken by the previous script
filesToUpdateCurrency.forEach(file => {
  replaceInFile(file, /₹\{/g, '${');
});

console.log('Fix done');
