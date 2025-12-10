export class CreateLanguageDto {
    _id: string;
    name: string;
    nativeName?: string | null;
    active?: boolean;
    translations?: Record<string, string>;
}
