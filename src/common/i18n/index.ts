import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { en, type TranslationKey } from "./en";
import { ml } from "./ml";

export type Language = "en" | "ml";
export type TranslationParams = Record<string, string | number>;

type LanguageState = {
	language: Language;
	setLanguage: (language: Language) => void;
};

const dictionaries: Record<Language, Record<TranslationKey, string>> = { en, ml };

export const locales: Record<Language, string> = { en: "en-IN", ml: "ml-IN" };

const LANGUAGE_KEY = "sfck.language";

export const useLanguageStore = create<LanguageState>((set) => ({
	language: "en",
	setLanguage: (language) => {
		set({ language });
		SecureStore.setItemAsync(LANGUAGE_KEY, language).catch(() => undefined);
	},
}));

export async function hydrateLanguage(): Promise<void> {
	const stored = await SecureStore.getItemAsync(LANGUAGE_KEY).catch(() => null);
	if (stored === "en" || stored === "ml") useLanguageStore.setState({ language: stored });
}

function translate(language: Language, key: TranslationKey, params?: TranslationParams): string {
	const template = dictionaries[language][key] ?? en[key];
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

export function t(key: TranslationKey, params?: TranslationParams): string {
	return translate(useLanguageStore.getState().language, key, params);
}

export function useT() {
	const language = useLanguageStore((state) => state.language);
	return (key: TranslationKey, params?: TranslationParams) => translate(language, key, params);
}

export type { TranslationKey };
