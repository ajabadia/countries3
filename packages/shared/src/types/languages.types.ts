export interface ILanguage {
    _id: string; // ISO 639 code (e.g., "en", "es", "ca")
    name: string; // English name
    nativeName: string | null; // Name in the language itself
    active: boolean;
    translations: Record<string, string>; // Translations in different languages
}

export interface CreateLanguageDto {
    _id: string;
    name: string;
    nativeName?: string | null;
    active?: boolean;
    translations?: Record<string, string>;
}

export interface UpdateLanguageDto {
    name?: string;
    nativeName?: string | null;
    active?: boolean;
    translations?: Record<string, string>;
}
