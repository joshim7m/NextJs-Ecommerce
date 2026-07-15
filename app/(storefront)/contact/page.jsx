import Link from 'next/link';
import prisma from '../../../src/lib/prisma';

export const metadata = {
  title: 'Contact Us | Radiant Picks',
  description: 'Get in touch with Radiant Picks. Contact us for orders, inquiries, or support. We\'re here to help across Bangladesh.',
  alternates: { canonical: '/contact' },
};

async function getSettings() {
  try {
    const settings = await prisma.siteSetting.findFirst();
    return JSON.parse(JSON.stringify(settings || {}));
  } catch {
    return {};
  }
}

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#2f0f6b] dark:hover:text-[#a78bfa] transition-colors">Home</Link>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-slate-600 dark:text-slate-300">Contact Us</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Contact Us</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">We&apos;d love to hear from you. Here&apos;s how you can reach us.</p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Get in Touch</h2>

            <div className="mt-4 space-y-4">
              {settings?.mobile && (
                <a href={`tel:${settings.mobile}`} className="flex items-center gap-3 text-slate-600 hover:text-[#2f0f6b] transition dark:text-slate-300 dark:hover:text-[#a78bfa]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                    <svg className="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Phone</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{settings.mobile}</p>
                  </div>
                </a>
              )}

              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-slate-600 hover:text-[#2f0f6b] transition dark:text-slate-300 dark:hover:text-[#a78bfa]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                    <svg className="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Email</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{settings.email}</p>
                  </div>
                </a>
              )}

              {settings?.address && (
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                    <svg className="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Address</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{settings.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Send a Message</h2>
          <form className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
              <input type="text" id="name" name="name" required className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b] dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-[#a78bfa] dark:focus:ring-[#a78bfa]" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input type="email" id="email" name="email" required className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b] dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-[#a78bfa] dark:focus:ring-[#a78bfa]" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
              <textarea id="message" name="message" rows={4} required className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#2f0f6b] focus:outline-none focus:ring-1 focus:ring-[#2f0f6b] dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-[#a78bfa] dark:focus:ring-[#a78bfa]" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-[#2f0f6b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#2f0f6b]/90 transition dark:bg-[#a78bfa] dark:text-slate-900">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
