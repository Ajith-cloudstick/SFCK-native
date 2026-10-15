const http = require("http");
const { getDefaultConfig } = require("expo/metro-config");

const API_TARGET = new URL(process.env.SFCK_API_TARGET || "http://127.0.0.1:8095");

const config = getDefaultConfig(__dirname);

// Dev only: forwards /api/v1/* from the phone (LAN or --tunnel) to the API running on this PC
const proxyApi = (req, res) => {
	const upstream = http.request(
		{ hostname: API_TARGET.hostname, port: API_TARGET.port, path: req.url, method: req.method, headers: { ...req.headers, host: API_TARGET.host } },
		(response) => {
			res.writeHead(response.statusCode || 502, response.headers);
			response.pipe(res);
		},
	);
	upstream.on("error", () => {
		res.writeHead(502, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ success: false, error: "The SFCK server on this computer is not running." }));
	});
	req.pipe(upstream);
};

const originalEnhance = config.server?.enhanceMiddleware;

config.server = {
	...config.server,
	enhanceMiddleware: (metroMiddleware, server) => {
		const base = originalEnhance ? originalEnhance(metroMiddleware, server) : metroMiddleware;
		return (req, res, next) => (req.url && req.url.startsWith("/api/v1/") ? proxyApi(req, res) : base(req, res, next));
	},
};

// Web preview for presentations (phone frame in the browser). Remove with the web/ folder
require("./web/metro").withWebPreview(config);

module.exports = config;
