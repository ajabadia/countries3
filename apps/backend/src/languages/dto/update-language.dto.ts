export class UpdateLanguageDto {
    name?: string;
    nativeName?: string | null;
    active?: boolean;
    translations?: Record<string, string>;
}
