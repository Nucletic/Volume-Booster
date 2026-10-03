type Message = {
  volume?: number;
  muted?: boolean;
  action?: string;
  streamId?: string;
  tabId?: number;
};

let gainNodes = new Map<number, GainNode>();
let currentVolume: number = 1;
let isMuted: boolean = false;
const starting = new Map<number, Promise<void>>();

const startAudio = async (tabId: number, streamId: string) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      // @ts-ignore
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
  });
  const ctx = new AudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  const source = ctx.createMediaStreamSource(stream);

  let gainNode = ctx.createGain();
  gainNode.gain.value = currentVolume;

  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  gainNodes.set(tabId, gainNode);
};


export default defineUnlistedScript(() => {
  browser.runtime.onMessage.addListener((message: Message) => {

    if (message.action === "start_audio") {
      const tabId = message.tabId;
      const streamId = message.streamId;

      if (tabId === undefined || !streamId) {
        browser.runtime.sendMessage({ action: "error", error: `Invalid start_audio: tabId=${tabId}, streamId=${streamId}` });
        return;
      }

      if (gainNodes.has(tabId)) {
        browser.runtime.sendMessage({ action: "all_set" });
        return;
      }

      if (starting.has(tabId)) return;

      const promise = startAudio(tabId, streamId);

      promise.then(() => {
        browser.runtime.sendMessage({ action: "all_set" });
      }).catch((error) => {
        browser.runtime.sendMessage({ action: "error", error: `ERROR START_AUDIO: ${tabId} ${streamId} ${error}` });
      }).finally(() => {
        starting.delete(tabId);
      });
    }


    if (message.action === "set_volume") {
      currentVolume = Math.min(Math.max(message.volume! / 100, 1), 10);
      if (message.tabId) {
        let gainNode = gainNodes.get(message.tabId);
        if (gainNode) {
          gainNode.gain.value = isMuted ? 0 : currentVolume;
        }
      }
    }

    if (message.action === "set_muted") {
      isMuted = message.muted!;
      if (message.tabId) {
        let gainNode = gainNodes.get(message.tabId);
        if (gainNode) {
          gainNode.gain.value = isMuted ? 0 : currentVolume;

        }
      }
    }
  });
});
