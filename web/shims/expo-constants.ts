import Constants from "expo-constants";

export * from "expo-constants";

// The browser has no Metro hostUri. Use the page's own host, so httpClient sends /api/v1 to the
// Expo dev server that served the page, and its proxy forwards to the API (localhost or tunnel)
const hostUri = typeof window !== "undefined" ? window.location.host : undefined;

const WebConstants = new Proxy(Constants, {
	get(target, key, receiver) {
		if (key !== "expoConfig") return Reflect.get(target, key, receiver);
		const expoConfig = Reflect.get(target, key, receiver) as typeof Constants.expoConfig;
		return { ...expoConfig, hostUri };
	},
});

export default WebConstants;
