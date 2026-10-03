import { useState, type ChangeEvent } from "react";
import "./App.css";
import getActiveTab from "./Utils";

type Settings = {
  volume?: number;
  muted?: boolean;
};

type Message = {
  volume?: number;
  muted?: boolean;
  action?: string;
  streamId?: string;
  error?: string;
  message?: string;
};

function App() {
  const [volume, setVolume] = useState<number | null>(null);
  const [mute, setMute] = useState<boolean | null>(null);
  const tabIdRef = useRef<number | undefined>(undefined);


  // change volume and send to offscreen for audio change
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const handleVolumeRelease = () => {
    browser.runtime.sendMessage({ tabId: tabIdRef.current, volume, action: "set_volume" });
    if (!volume) return;
    saveSettings("volume", volume);
  };

  // change mute and send to offscreen for mute change
  const handleMuteToggle = (e: ChangeEvent<HTMLInputElement>) => {
    setMute(e.target.checked);
    browser.runtime.sendMessage({ tabId: tabIdRef.current, muted: e.target.checked, action: "set_muted" });
    saveSettings("muted", e.target.checked);
  };

  // save settings changes that are made on the frontend
  const saveSettings = async (key: "volume" | "muted", value: number | boolean) => {
    const tabId = tabIdRef.current;
    if (tabId === undefined) return;

    const storageKey = String(tabId);

    const state = await browser.storage.local.get([storageKey]);
    const settings = (state[storageKey] ?? {}) as Settings;

    await browser.storage.local.set({ [storageKey]: { ...settings, [key]: value } });
  };

  // to reset volume to default values
  const handleResetVolume = () => {
    setVolume(100);
    setMute(false);

    saveSettings("volume", 100);
    saveSettings("muted", false);

    browser.runtime.sendMessage({ tabId: tabIdRef.current, volume: 100, action: "set_volume" });
    browser.runtime.sendMessage({ tabId: tabIdRef.current, muted: false, action: "set_muted" });
  };

  // fetch the settings from localStorage on pop load.
  const fetchSettings = async () => {
    try {
      if (!tabIdRef.current) return;
      const state = await browser.storage.local.get([String(tabIdRef.current)]);
      const settings = (state[String(tabIdRef.current)] ?? {}) as Settings;

      const newVolume = settings.volume ? settings.volume : 100;
      const newMuted = settings.muted ?? false;

      setVolume(newVolume);
      setMute(newMuted);

      browser.runtime.sendMessage({ tabId: tabIdRef.current, volume: newVolume, action: "set_volume" });
      browser.runtime.sendMessage({ tabId: tabIdRef.current, muted: newMuted, action: "set_muted" });
    } catch (error) {
      console.error(error);
    }
  };

  // message listener from the server worker
  useEffect(() => {
    const listener = (message: Message) => {
      if (message.action === "error") console.log(message.error);
      if (message.action === "logs") console.log(message);
      if (message.action === "offscreen_document_ready") browser.runtime.sendMessage({ action: "start_capture", tabId: tabIdRef.current });
      if (message.action === "all_set") fetchSettings();
    };

    browser.runtime.onMessage.addListener(listener);
    return () => browser.runtime.onMessage.removeListener(listener);
  }, []);

  useEffect(() => {
    const init = async () => {
      const tabId = await getActiveTab();
      if (tabId !== undefined) {
        tabIdRef.current = tabId;
        await browser.runtime.sendMessage({ action: "popup_ready" });
      }
    };
    init();
  }, []);



  return (
    <div className="popup">
      {volume !== null && mute !== null ? (
        <>
          <div className="first_half">
            <p className="volume">{`Volume: ${volume}%`}</p>
            <input
              id="volume_range"
              type="range"
              min={100}
              max={1000}
              value={volume}
              onChange={handleVolumeChange}
              onMouseUp={handleVolumeRelease}
              onTouchEnd={handleVolumeRelease}
            />
            <p className="warning" style={{ visibility: volume >= 300 ? "visible" : "hidden" }}>
              ⚠️ High gain may distort audio, use at your own risk!
            </p>
            <div className="mute">
              <input
                type="checkbox"
                id="mute_check"
                checked={mute}
                onChange={handleMuteToggle}
              />
              <label htmlFor="mute_check">Mute</label>
            </div>
            <button className="reset_volume" onClick={handleResetVolume}>Reset To 100%</button>
          </div>
          <div className="second_half">
            <p className="attribution">
              Made with ❤️🌸 by{" "}
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/Nucletic">
                潘舒Pānsu.
              </a>
            </p>
          </div>
        </>
      ) : (
        <h4 style={{ color: "#000" }}>Loading...</h4>
      )}
    </div>
  );
}

export default App;
