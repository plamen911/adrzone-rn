// Hermes' String.prototype.toLowerCase is unreliable for Cyrillic on some
// React Native builds, and SQLite's LOWER()/COLLATE NOCASE only fold ASCII.
// This helper guarantees Cyrillic uppercase -> lowercase regardless of engine,
// so search input matches the substance_lower column baked into the bundled DB.

const CYRILLIC_LOWER: Record<string, string> = {
  А: 'а', Б: 'б', В: 'в', Г: 'г', Д: 'д', Е: 'е', Ж: 'ж', З: 'з', И: 'и',
  Й: 'й', К: 'к', Л: 'л', М: 'м', Н: 'н', О: 'о', П: 'п', Р: 'р', С: 'с',
  Т: 'т', У: 'у', Ф: 'ф', Х: 'х', Ц: 'ц', Ч: 'ч', Ш: 'ш', Щ: 'щ', Ъ: 'ъ',
  Ь: 'ь', Ю: 'ю', Я: 'я', Ё: 'ё', Ы: 'ы', Э: 'э', І: 'і', Ї: 'ї', Є: 'є',
  Ў: 'ў',
};

export function lowerCyrillicSafe(s: string): string {
  return s.toLowerCase().replace(/[А-ЯЁЫЭЪЬІЇЄЎ]/g, (c) => CYRILLIC_LOWER[c] ?? c);
}
