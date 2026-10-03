import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],

  manifest: {
    name: "Volume Booster",
    description:
      "Increase the Max Volume of videos or audios on the current tab",

    permissions: ["tabCapture", "offscreen", "storage"],
    icons: {
      16: "icons/icon16.png",
      32: "icons/icon32.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    },
  },
});
