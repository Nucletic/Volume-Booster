(function() {
	//#region node_modules/wxt/dist/utils/define-unlisted-script.mjs
	function defineUnlistedScript(arg) {
		if (arg == null || typeof arg === "function") return { main: arg };
		return arg;
	}
	//#endregion
	//#region node_modules/wxt/dist/browser.mjs
	/**
	* Contains the `browser` export which you should use to access the extension
	* APIs in your project:
	*
	* ```ts
	* import { browser } from 'wxt/browser';
	*
	* browser.runtime.onInstalled.addListener(() => {
	*   // ...
	* });
	* ```
	*
	* @module wxt/browser
	*/
	var browser = globalThis.browser?.runtime?.id ? globalThis.browser : globalThis.chrome;
	//#endregion
	//#region entrypoints/offscreen.ts
	var gainNodes = /* @__PURE__ */ new Map();
	var currentVolume = 1;
	var isMuted = false;
	var starting = /* @__PURE__ */ new Map();
	var startAudio = async (tabId, streamId) => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: { mandatory: {
			chromeMediaSource: "tab",
			chromeMediaSourceId: streamId
		} } });
		const ctx = new AudioContext();
		if (ctx.state === "suspended") await ctx.resume();
		const source = ctx.createMediaStreamSource(stream);
		let gainNode = ctx.createGain();
		gainNode.gain.value = currentVolume;
		source.connect(gainNode);
		gainNode.connect(ctx.destination);
		gainNodes.set(tabId, gainNode);
	};
	var offscreen_default = defineUnlistedScript(() => {
		browser.runtime.onMessage.addListener((message) => {
			if (message.action === "start_audio") {
				const tabId = message.tabId;
				const streamId = message.streamId;
				if (tabId === void 0 || !streamId) {
					browser.runtime.sendMessage({
						action: "error",
						error: `Invalid start_audio: tabId=${tabId}, streamId=${streamId}`
					});
					return;
				}
				if (gainNodes.has(tabId)) {
					browser.runtime.sendMessage({ action: "all_set" });
					return;
				}
				if (starting.has(tabId)) return;
				startAudio(tabId, streamId).then(() => {
					browser.runtime.sendMessage({ action: "all_set" });
				}).catch((error) => {
					browser.runtime.sendMessage({
						action: "error",
						error: `ERROR START_AUDIO: ${tabId} ${streamId} ${error}`
					});
				}).finally(() => {
					starting.delete(tabId);
				});
			}
			if (message.action === "set_volume") {
				currentVolume = Math.min(Math.max(message.volume / 100, 1), 10);
				if (message.tabId) {
					let gainNode = gainNodes.get(message.tabId);
					if (gainNode) gainNode.gain.value = isMuted ? 0 : currentVolume;
				}
			}
			if (message.action === "set_muted") {
				isMuted = message.muted;
				if (message.tabId) {
					let gainNode = gainNodes.get(message.tabId);
					if (gainNode) gainNode.gain.value = isMuted ? 0 : currentVolume;
				}
			}
		});
	});
	//#endregion
	//#region \0virtual:wxt-unlisted-script-entrypoint?/home/pansu/volume_booster/entrypoints/offscreen.ts
	function print(method, ...args) {
		if (typeof args[0] === "string") method(`[wxt] ${args.shift()}`, ...args);
		else method("[wxt]", ...args);
	}
	/** Wrapper around `console` with a "[wxt]" prefix */
	var logger = {
		debug: (...args) => print(console.debug, ...args),
		log: (...args) => print(console.log, ...args),
		warn: (...args) => print(console.warn, ...args),
		error: (...args) => print(console.error, ...args)
	};
	//#endregion
	return (() => {
		let result;
		try {
			result = offscreen_default.main();
			if (result instanceof Promise) result = result.catch((err) => {
				logger.error(`The unlisted script "offscreen" crashed on startup!`, err);
				throw err;
			});
		} catch (err) {
			logger.error(`The unlisted script "offscreen" crashed on startup!`, err);
			throw err;
		}
		return result;
	})();
})();

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2Zmc2NyZWVuLmpzIiwibmFtZXMiOlsiYnJvd3NlciJdLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9kZWZpbmUtdW5saXN0ZWQtc2NyaXB0Lm1qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9Ad3h0LWRldi9icm93c2VyL3NyYy9pbmRleC5tanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvYnJvd3Nlci5tanMiLCIuLi8uLi9lbnRyeXBvaW50cy9vZmZzY3JlZW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8jcmVnaW9uIHNyYy91dGlscy9kZWZpbmUtdW5saXN0ZWQtc2NyaXB0LnRzXG5mdW5jdGlvbiBkZWZpbmVVbmxpc3RlZFNjcmlwdChhcmcpIHtcblx0aWYgKGFyZyA9PSBudWxsIHx8IHR5cGVvZiBhcmcgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHsgbWFpbjogYXJnIH07XG5cdHJldHVybiBhcmc7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGRlZmluZVVubGlzdGVkU2NyaXB0IH07XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcbmV4cG9ydCBjb25zdCBicm93c2VyID0gZ2xvYmFsVGhpcy5icm93c2VyPy5ydW50aW1lPy5pZFxuICA/IGdsb2JhbFRoaXMuYnJvd3NlclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xuLy8gI2VuZHJlZ2lvbiBzbmlwcGV0XG4iLCJpbXBvcnQgeyBicm93c2VyIGFzIGJyb3dzZXIkMSB9IGZyb20gXCJAd3h0LWRldi9icm93c2VyXCI7XG4vLyNyZWdpb24gc3JjL2Jyb3dzZXIudHNcbi8qKlxuKiBDb250YWlucyB0aGUgYGJyb3dzZXJgIGV4cG9ydCB3aGljaCB5b3Ugc2hvdWxkIHVzZSB0byBhY2Nlc3MgdGhlIGV4dGVuc2lvblxuKiBBUElzIGluIHlvdXIgcHJvamVjdDpcbipcbiogYGBgdHNcbiogaW1wb3J0IHsgYnJvd3NlciB9IGZyb20gJ3d4dC9icm93c2VyJztcbipcbiogYnJvd3Nlci5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKCgpID0+IHtcbiogICAvLyAuLi5cbiogfSk7XG4qIGBgYFxuKlxuKiBAbW9kdWxlIHd4dC9icm93c2VyXG4qL1xuY29uc3QgYnJvd3NlciA9IGJyb3dzZXIkMTtcbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgYnJvd3NlciB9O1xuIiwidHlwZSBNZXNzYWdlID0ge1xuICB2b2x1bWU/OiBudW1iZXI7XG4gIG11dGVkPzogYm9vbGVhbjtcbiAgYWN0aW9uPzogc3RyaW5nO1xuICBzdHJlYW1JZD86IHN0cmluZztcbiAgdGFiSWQ/OiBudW1iZXI7XG59O1xuXG5sZXQgZ2Fpbk5vZGVzID0gbmV3IE1hcDxudW1iZXIsIEdhaW5Ob2RlPigpO1xubGV0IGN1cnJlbnRWb2x1bWU6IG51bWJlciA9IDE7XG5sZXQgaXNNdXRlZDogYm9vbGVhbiA9IGZhbHNlO1xuY29uc3Qgc3RhcnRpbmcgPSBuZXcgTWFwPG51bWJlciwgUHJvbWlzZTx2b2lkPj4oKTtcblxuY29uc3Qgc3RhcnRBdWRpbyA9IGFzeW5jICh0YWJJZDogbnVtYmVyLCBzdHJlYW1JZDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHN0cmVhbSA9IGF3YWl0IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHtcbiAgICBhdWRpbzoge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgbWFuZGF0b3J5OiB7XG4gICAgICAgIGNocm9tZU1lZGlhU291cmNlOiBcInRhYlwiLFxuICAgICAgICBjaHJvbWVNZWRpYVNvdXJjZUlkOiBzdHJlYW1JZCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbiAgaWYgKGN0eC5zdGF0ZSA9PT0gXCJzdXNwZW5kZWRcIikge1xuICAgIGF3YWl0IGN0eC5yZXN1bWUoKTtcbiAgfVxuICBjb25zdCBzb3VyY2UgPSBjdHguY3JlYXRlTWVkaWFTdHJlYW1Tb3VyY2Uoc3RyZWFtKTtcblxuICBsZXQgZ2Fpbk5vZGUgPSBjdHguY3JlYXRlR2FpbigpO1xuICBnYWluTm9kZS5nYWluLnZhbHVlID0gY3VycmVudFZvbHVtZTtcblxuICBzb3VyY2UuY29ubmVjdChnYWluTm9kZSk7XG4gIGdhaW5Ob2RlLmNvbm5lY3QoY3R4LmRlc3RpbmF0aW9uKTtcbiAgZ2Fpbk5vZGVzLnNldCh0YWJJZCwgZ2Fpbk5vZGUpO1xufTtcblxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVVbmxpc3RlZFNjcmlwdCgoKSA9PiB7XG4gIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IHtcblxuICAgIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gXCJzdGFydF9hdWRpb1wiKSB7XG4gICAgICBjb25zdCB0YWJJZCA9IG1lc3NhZ2UudGFiSWQ7XG4gICAgICBjb25zdCBzdHJlYW1JZCA9IG1lc3NhZ2Uuc3RyZWFtSWQ7XG5cbiAgICAgIGlmICh0YWJJZCA9PT0gdW5kZWZpbmVkIHx8ICFzdHJlYW1JZCkge1xuICAgICAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBhY3Rpb246IFwiZXJyb3JcIiwgZXJyb3I6IGBJbnZhbGlkIHN0YXJ0X2F1ZGlvOiB0YWJJZD0ke3RhYklkfSwgc3RyZWFtSWQ9JHtzdHJlYW1JZH1gIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChnYWluTm9kZXMuaGFzKHRhYklkKSkge1xuICAgICAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBhY3Rpb246IFwiYWxsX3NldFwiIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGFydGluZy5oYXModGFiSWQpKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHByb21pc2UgPSBzdGFydEF1ZGlvKHRhYklkLCBzdHJlYW1JZCk7XG5cbiAgICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgIGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSh7IGFjdGlvbjogXCJhbGxfc2V0XCIgfSk7XG4gICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKHsgYWN0aW9uOiBcImVycm9yXCIsIGVycm9yOiBgRVJST1IgU1RBUlRfQVVESU86ICR7dGFiSWR9ICR7c3RyZWFtSWR9ICR7ZXJyb3J9YCB9KTtcbiAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICBzdGFydGluZy5kZWxldGUodGFiSWQpO1xuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBpZiAobWVzc2FnZS5hY3Rpb24gPT09IFwic2V0X3ZvbHVtZVwiKSB7XG4gICAgICBjdXJyZW50Vm9sdW1lID0gTWF0aC5taW4oTWF0aC5tYXgobWVzc2FnZS52b2x1bWUhIC8gMTAwLCAxKSwgMTApO1xuICAgICAgaWYgKG1lc3NhZ2UudGFiSWQpIHtcbiAgICAgICAgbGV0IGdhaW5Ob2RlID0gZ2Fpbk5vZGVzLmdldChtZXNzYWdlLnRhYklkKTtcbiAgICAgICAgaWYgKGdhaW5Ob2RlKSB7XG4gICAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IGlzTXV0ZWQgPyAwIDogY3VycmVudFZvbHVtZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLmFjdGlvbiA9PT0gXCJzZXRfbXV0ZWRcIikge1xuICAgICAgaXNNdXRlZCA9IG1lc3NhZ2UubXV0ZWQhO1xuICAgICAgaWYgKG1lc3NhZ2UudGFiSWQpIHtcbiAgICAgICAgbGV0IGdhaW5Ob2RlID0gZ2Fpbk5vZGVzLmdldChtZXNzYWdlLnRhYklkKTtcbiAgICAgICAgaWYgKGdhaW5Ob2RlKSB7XG4gICAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IGlzTXV0ZWQgPyAwIDogY3VycmVudFZvbHVtZTtcblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuIl0sInhfZ29vZ2xl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