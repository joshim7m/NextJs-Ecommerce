'use client';

import {
  ImageUpload,
  InputField,
  SaveBar,
  SectionCard,
  SECTION_ICONS,
  SettingsHeader,
  SettingsSkeleton,
  Toast,
  useSettingsForm,
} from '../_components/settings-ui';

// Only the branding / contact / content fields live here — SEO & sharing is
// owned by /admin/settings/site-config, so this page never reads or writes it.
const EMPTY_FORM = {
  siteName: '',
  logo: '',
  favicon: '',
  mobile: '',
  email: '',
  address: '',
  copyrightText: '',
  announcementText: '',
  aboutCompany: '',
  aboutCompanyBn: '',
};

export default function SiteSettingsPage() {
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
  } = useSettingsForm('/api/admin/settings/site', EMPTY_FORM);

  if (loading) return <SettingsSkeleton sections={4} />;

  return (
    <div className="mx-auto max-w-4xl">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <SettingsHeader
        icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        title="Site Setting"
        subtitle="Your store identity, contact details and customer-facing copy."
        dirty={dirty}
      />

      <div className="space-y-4 sm:space-y-6">
        <SectionCard
          title="Brand Identity"
          description="Your site name and the visual assets used across the storefront."
          icon={SECTION_ICONS.brand}
        >
          <InputField
            label="Company Name"
            value={form.siteName}
            onChange={set('siteName')}
            placeholder="Your Company Name"
            hint="Used in the header, the footer, page titles and structured data."
          />

          <div className="flex flex-wrap items-start gap-6">
            <ImageUpload
              label="Logo"
              field="logo"
              value={form.logo}
              onUpload={handleUpload}
              onRemove={handleRemove}
            />
            <ImageUpload
              label="Favicon"
              field="favicon"
              value={form.favicon}
              onUpload={handleUpload}
              onRemove={handleRemove}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Contact"
          description="How customers reach you — shown in the header, footer and contact page."
          icon={SECTION_ICONS.contact}
        >
          <div className="grid gap-5 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <InputField
                label="Mobile"
                value={form.mobile}
                onChange={set('mobile')}
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>
            <div className="sm:col-span-3">
              <InputField
                label="Email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="contact@example.com"
              />
            </div>
          </div>
          <InputField
            label="Address"
            value={form.address}
            onChange={set('address')}
            placeholder="Enter your business address"
            rows={3}
          />
        </SectionCard>

        <SectionCard
          title="Notices & Footer"
          description="The announcement bar at the top of every page, and the footer copyright line."
          icon={SECTION_ICONS.notices}
        >
          <div className="grid gap-5 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <InputField
                label="Announcement Text"
                value={form.announcementText}
                onChange={set('announcementText')}
                placeholder="Call or WhatsApp us to order: +880 1XXX-XXXXXX"
                hint="Leave empty to hide the announcement bar."
              />
            </div>
            <div className="lg:col-span-2">
              <InputField
                label="Copyright Text"
                value={form.copyrightText}
                onChange={set('copyrightText')}
                placeholder="© 2026 Your Company. All rights reserved."
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="About Company"
          description="Company description shown on the About page and reused as a SEO fallback."
          icon={SECTION_ICONS.about}
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <InputField
              label="About Company (English)"
              value={form.aboutCompany}
              onChange={set('aboutCompany')}
              placeholder="Tell customers about your company..."
              rows={8}
            />
            <InputField
              label="About Company (বাংলা)"
              value={form.aboutCompanyBn}
              onChange={set('aboutCompanyBn')}
              placeholder="আপনার কোম্পানি সম্পর্কে গ্রাহকদের জানান..."
              rows={8}
            />
          </div>
        </SectionCard>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={discard} />
    </div>
  );
}
