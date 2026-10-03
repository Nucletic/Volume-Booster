import type { PublicPath } from "wxt/browser";

type Message = {
  volume?: number;
  muted?: boolean;
  action?: string;
  streamId?: string;
  tabId?: number;
};

export default defineBackground(() => {
  const streams = new Map<number, string>();
  let creating: Promise<void> | null = null;

  // setup offscreen document to use the tabcapture api
  async function setupOffscreen() {
    const url = browser.runtime.getURL("offscreen.html" as PublicPath);

    const contexts = await browser.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"], documentUrls: [url],
    });
    if (contexts.length > 0) return;

    if (!creating) {
      creating = browser.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["USER_MEDIA"],
        justification: "Process captured tab audio",
      });

      try {
        await creating;
      } finally {
        creating = null;
      }
    }
  }

  // get the current active tab streamId and send to the offscreen for start audio capture
  const startCapture = async (tabId: number) => {
    let streamId = await browser.tabCapture.getMediaStreamId({ targetTabId: tabId });
    streams.set(tabId, streamId);
  };

  browser.runtime.onMessage.addListener((message: Message) => {
    if (message.action === "popup_ready") {
      setupOffscreen().then(() => {
        browser.runtime.sendMessage({ action: "offscreen_document_ready" });
      }).catch((error) => {
        browser.runtime.sendMessage({ action: "error", error: `ERROR OFFSCREEN_SETUP: ${error.message}` });
      });
    }


    if (message.action === "start_capture") {
      const tabId = message.tabId;
      if (tabId === undefined) return;

      if (streams.has(tabId)) {
        browser.runtime.sendMessage({ action: "start_audio", streamId: streams.get(tabId), tabId });
        return;
      }
      startCapture(tabId).then(() => {
        const streamId = streams.get(tabId);
        if (!streamId) {
          browser.runtime.sendMessage({ action: "error", error: "ERROR START_CAPTURE no stream ID" });
          return;
        }
        browser.runtime.sendMessage({ action: "start_audio", streamId, tabId });
      }).catch((error) => {
        browser.runtime.sendMessage({ action: "error", error: "ERROR START_CAPTURE: " + error });
      });
    }

  });


  const clearLocalSettings = async (tabId: string) => {
    await browser.storage.local.remove([tabId]);
  }

  browser.tabs.onRemoved.addListener((tabId) => {
    clearLocalSettings(tabId.toString());
  });
});
