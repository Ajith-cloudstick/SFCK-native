// Web preview for presentations. Everything web-only lives in this folder; the phone build never
// loads any of it. To remove the preview: delete this folder and the withWebPreview line in
// ../metro.config.js (see README.md here).
const fs = require("fs");
const path = require("path");

const WEB_DIR = __dirname;
const SRC_DIR = path.join(WEB_DIR, "..", "src");
const ROOT_LAYOUT = path.join(SRC_DIR, "app", "_layout.tsx");
const PREVIEW_PAGE = path.join(WEB_DIR, "preview.html");

// App files replaced by a web version, matched on the resolved file
const FILE_SWAPS = {
	[path.join(SRC_DIR, "common", "db", "cacheRepo.ts")]: path.join(WEB_DIR, "db", "cacheRepo.ts"),
	[path.join(SRC_DIR, "common", "db", "outboxRepo.ts")]: path.join(WEB_DIR, "db", "outboxRepo.ts"),
	[path.join(SRC_DIR, "common", "theme", "shadows.ts")]: path.join(WEB_DIR, "theme", "shadows.ts"),
};

// Packages replaced by a web shim when app code (src/) imports them
const PACKAGE_SWAPS = {
	"expo-secure-store": path.join(WEB_DIR, "shims", "expo-secure-store.ts"),
	"expo-constants": path.join(WEB_DIR, "shims", "expo-constants.ts"),
	"react-native-safe-area-context": path.join(WEB_DIR, "shims", "safe-area-context.ts"),
};

// Metro endpoints and assets that must never be answered with the phone frame
const NOT_A_PAGE = /^\/(api|_expo|node_modules|assets|--|message|status|logs|symbolicate|inspector|json|debugger-ui|open-stack-frame)(\/|$)/;

const normalise = (file) => path.resolve(file).toLowerCase();
const isInside = (file, dir) => !!file && normalise(file).startsWith(normalise(dir) + path.sep);
const swapFor = (file) => Object.entries(FILE_SWAPS).find(([from]) => normalise(from) === normalise(file))?.[1];

function withWebResolver(config) {
	const upstream = config.resolver?.resolveRequest;
	config.resolver = {
		...config.resolver,
		resolveRequest: (context, moduleName, platform) => {
			const resolve = upstream ?? context.resolveRequest;
			if (platform !== "web") return resolve(context, moduleName, platform);

			const origin = context.originModulePath;
			if (isInside(origin, SRC_DIR) && PACKAGE_SWAPS[moduleName]) return { type: "sourceFile", filePath: PACKAGE_SWAPS[moduleName] };
			if (moduleName === "expo-router" && origin && normalise(origin) === normalise(ROOT_LAYOUT)) {
				return { type: "sourceFile", filePath: path.join(WEB_DIR, "shims", "expo-router.tsx") };
			}

			const result = resolve(context, moduleName, platform);
			const swap = result.type === "sourceFile" && !isInside(origin, WEB_DIR) ? swapFor(result.filePath) : undefined;
			return swap ? { ...result, filePath: swap } : result;
		},
	};
}

// A browser opening an app route gets the phone frame; the frame's iframe (and ?frame=off) gets the app.
// "/" itself is answered by Expo's manifest handler before this runs, so setup.ts sends it to /preview.
function isFrameRequest(req) {
	if (req.method !== "GET") return false;
	const url = new URL(req.url, "http://localhost");
	if (url.pathname === "/preview") return true;
	if (req.headers["sec-fetch-dest"] !== "document") return false;
	if (url.searchParams.get("frame") === "off" || NOT_A_PAGE.test(url.pathname)) return false;
	return !path.extname(url.pathname);
}

function withPreviewPage(config) {
	const upstream = config.server?.enhanceMiddleware;
	config.server = {
		...config.server,
		enhanceMiddleware: (metroMiddleware, server) => {
			const base = upstream ? upstream(metroMiddleware, server) : metroMiddleware;
			return (req, res, next) => {
				if (!isFrameRequest(req)) return base(req, res, next);
				res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
				res.end(fs.readFileSync(PREVIEW_PAGE));
			};
		},
	};
}

function withWebPreview(config) {
	withWebResolver(config);
	withPreviewPage(config);
	return config;
}

module.exports = { withWebPreview };
