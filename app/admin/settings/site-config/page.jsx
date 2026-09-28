'use client';

import { useState } from 'react';

import {
  CharCount,
  ImageUpload,
  InputField,
  KeywordCount,
  META_DESC_MAX,
  META_TITLE_MAX,
  SaveBar,
  SectionCard,
  SECTION_ICONS,
  SeoPreview,
  SettingsHeader,
  SettingsSkeleton,
  Toast,
  useSettingsForm,
} from '../_components/settings-ui';

const EMPTY_FORM = {
  // read-only, used by the live preview only
  siteName: '',
  // SEO & sharing
  siteUrl: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  ogImage: '',
  // integrations
  telegramBotToken: '',
  telegramChatId: '',
  gtmId: '',
  whatsappNumber: '',
};

export default function SiteConfigPage() {
  const {
    form,
    set,
    dirty,
    saving,
    loading,
    save,
    discard,
    toast,
    setToast,
    handleUpload,
    handleRemove,
  } = useSettingsForm('/api/admin/settings/site-config', EMPTY_FORM);

  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/admin/settings/site-config/test', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setToast({ type: 'success', message: data.message || 'Test notification sent.' });
      } else {
        setToast({ type: 'error', message: data.error || 'Test notification failed.' });
      }
    } catch {
      setToast({ type: 'error', message: 'Test notification failed.' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <SettingsSkeleton sections={4} />;

  return (
    <div className="mx-auto max-w-4xl">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <SettingsHeader
        icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        title="Site Config"
        subtitle="Search engine defaults, social sharing and your integrations."
        dirty={dirty}
      />

      <div className="space-y-4 sm:space-y-6">
        <SectionCard
          title="SEO & Sharing"
          description="Defaults for search results, social previews and your public site address."
          icon={SECTION_ICONS.seo}
        >
          <InputField
            label="Site URL"
            value={form.siteUrl}
            onChange={set('siteUrl')}
            placeholder="https://example.com"
            hint="Drives canonical links, Open Graph URLs, sitemap.xml, robots.txt and the RSS feed. Leave empty to use NEXT_PUBLIC_SITE_URL."
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <InputField
              label="Meta Title"
              value={form.metaTitle}
              onChange={set('metaTitle')}
              placeholder="Your Company Name"
              footer={<CharCount value={form.metaTitle} max={META_TITLE_MAX} />}
              hint="Defaults to the company name. Appended to every page title."
            />
            <InputField
              label="Meta Keywords"
              value={form.metaKeywords}
              onChange={set('metaKeywords')}
              placeholder="lingerie Bangladesh, bra shop online BD, nightwear"
              footer={<KeywordCount value={form.metaKeywords} />}
              hint="Comma-separated."
            />
          </div>

          <InputField
            label="Meta Description"
            value={form.metaDescription}
            onChange={set('metaDescription')}
            placeholder="Shop premium lingerie, bras, panties & nightwear online in Bangladesh…"
            rows={3}
            footer={<CharCount value={form.metaDescription} max={META_DESC_MAX} />}
          />

          <ImageUpload
            label="Default Share Image (OG)"
            field="ogImage"
            value={form.ogImage}
            onUpload={handleUpload}
            onRemove={handleRemove}
          />

          <SeoPreview form={form} />
        </SectionCard>

        <SectionCard
          title="Telegram Alerts"
          description="Receive a push notification on Telegram every time a new order arrives. Values left blank fall back to the server environment variables."
          icon={SECTION_ICONS.notifications}
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <InputField
              label="Bot Token"
              type="password"
              value={form.telegramBotToken}
              onChange={set('telegramBotToken')}
              placeholder="123456789:AA..."
              hint="Get this from @BotFather when you create your bot."
            />
            <InputField
              label="Chat ID"
              value={form.telegramChatId}
              onChange={set('telegramChatId')}
              placeholder="1234567890"
              hint="Your Telegram user id, or the group/channel id. Message @userinfobot to find your id."
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-xl border border-[#2f0f6b]/20 bg-[#2f0f6b]/5 px-4 py-2.5 text-sm font-semibold text-[#2f0f6b] transition hover:bg-[#2f0f6b]/10 disabled:opacity-50 dark:border-[#a78bfa]/30 dark:bg-[#a78bfa]/10 dark:text-[#a78bfa] dark:hover:bg-[#a78bfa]/20"
            >
              {testing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l5-5v3a8 8 0 015 5h-3l5 5H2l3-3 3 3 2-2" />
                  </svg>
                  Send Test Notification
                </>
              )}
            </button>
          </div>
        </SectionCard>

        <div className="grid gap-4 sm:space-y-6 lg:grid-cols-2 lg:gap-6">
          <SectionCard
            title="Google Tag Manager"
            description="Your GTM container id, used to load analytics and tracking scripts across the storefront."
            icon={SECTION_ICONS.analytics}
          >
            <InputField
              label="GTM Container ID"
              value={form.gtmId}
              onChange={set('gtmId')}
              placeholder="GTM-XXXXXXX"
              hint="Found in the GTM dashboard when you set up your container."
            />
          </SectionCard>

          <SectionCard
            title="WhatsApp"
            description="Number customers message to place an order from product pages."
            icon={SECTION_ICONS.whatsapp}
          >
            <InputField
              label="WhatsApp Number"
              value={form.whatsappNumber}
              onChange={set('whatsappNumber')}
              placeholder="8801XXXXXXXXX"
              hint="Include country code without + sign, e.g. 8801945090085"
            />
          </SectionCard>
        </div>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={discard} />
    </div>
  );
}
