export default function ThankYouPage() {
  return (
    <section className="container py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm text-center">
        <h1 className="text-4xl font-bold">Thank you for your order</h1>
        <p className="mt-4 text-slate-600">Your order has been received and is being processed.</p>
        <p className="mt-6 text-lg">We will contact you shortly with shipping details.</p>
      </div>
    </section>
  );
}
