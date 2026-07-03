import './globals.css';

export const metadata = {
  title: 'Cabinet & Closet — Home',
  description: 'Carefully selected products for your home and everyday style.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning >{children}</body>
    </html>
  );
}
