import './globals.css';

export const metadata = {
  title: 'Cabinet Closet Ecommerce',
  description: 'Bangladeshi ecommerce storefront with admin panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
