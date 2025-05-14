export type Language = 'en' | 'id';

export interface TranslationContextType {
  lang: Language;
  switchLanguage: (lang: Language) => void;
}