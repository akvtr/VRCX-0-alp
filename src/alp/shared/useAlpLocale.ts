import { useTranslation } from 'react-i18next';

export type AlpLocale = 'en' | 'ja';

export type LocalizedText = Record<AlpLocale, string>;

const JAPANESE_LANGUAGE_PREFIX = 'ja';

// ALP modules keep their own strings instead of the shared locale files so
// they can be added or removed without touching upstream translations.
export function useAlpLocale(): AlpLocale {
    const { i18n } = useTranslation();
    return i18n.language?.startsWith(JAPANESE_LANGUAGE_PREFIX) ? 'ja' : 'en';
}
