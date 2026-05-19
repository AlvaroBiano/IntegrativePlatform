import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['pt-BR', 'en-US', 'fr', 'es'] as const;
type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale) locale = 'pt-BR';
  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

export { locales };
export type { Locale };
