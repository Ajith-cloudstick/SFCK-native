import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

// Escapes text placed inside generated HTML
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

// In a browser expo-print ignores the html and prints the page you are on, so the slip is written into a hidden frame
// and that frame is printed (the browser honours the slip's own @page size)
type PrintFrame = {
	style: Record<string, string>;
	srcdoc: string;
	onload: (() => void) | null;
	contentWindow: { focus(): void; print(): void } | null;
	remove(): void;
};

function printHtmlInBrowser(html: string): void {
	const browser = (globalThis as unknown as { document?: { createElement(tag: string): PrintFrame; body: { appendChild(frame: PrintFrame): void } } }).document;
	if (!browser) throw new Error("Nothing to print from");
	const frame = browser.createElement("iframe");
	Object.assign(frame.style, { position: "fixed", right: "0", bottom: "0", width: "1px", height: "1px", opacity: "0", border: "0" });
	frame.onload = () => {
		frame.contentWindow?.focus();
		frame.contentWindow?.print();
		setTimeout(() => frame.remove(), 1500);
	};
	frame.srcdoc = html;
	browser.body.appendChild(frame);
}

// Makes a PDF on the phone (works offline) and opens the share sheet: WhatsApp, Files, print...
// The browser preview has no files, so it prints instead
// size is the page in points (1 mm = 2.835 pt); a CSS @page size is ignored when the phone makes the PDF
export async function sharePdf(html: string, title: string, size?: { width: number; height: number }): Promise<void> {
	if (Platform.OS === "web") {
		printHtmlInBrowser(html);
		return;
	}
	const { uri } = await Print.printToFileAsync({ html, ...(size ?? {}) });
	if (!(await Sharing.isAvailableAsync())) {
		await Print.printAsync({ uri });
		return;
	}
	await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: title });
}
