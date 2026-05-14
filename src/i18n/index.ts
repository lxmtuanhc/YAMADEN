import { ja } from "./ja";
import { vi } from "./vi";
import type { Language } from "../types";

const dictionaries = { vi, ja };
export type TranslationKey = keyof typeof vi;

export function translate(language: Language, key: TranslationKey): string {
  return dictionaries[language][key] ?? vi[key] ?? key;
}
