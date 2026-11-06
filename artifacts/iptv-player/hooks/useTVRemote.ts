import { useEffect } from "react";
import { DeviceEventEmitter, Platform } from "react-native";

export type TVRemoteKey =
  | "up"
  | "down"
  | "left"
  | "right"
  | "select"
  | "playPause"
  | "channelUp"
  | "channelDown"
  | "menu"
  | "rewind"
  | "fastForward"
  | "back";

export interface TVRemoteHandlers {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onSelect?: () => void;
  onPlayPause?: () => void;
  onChannelUp?: () => void;
  onChannelDown?: () => void;
  onMenu?: () => void;
  onBack?: () => void;
  enabled?: boolean;
}

export function useTVRemote(handlers: TVRemoteHandlers) {
  const {
    onUp,
    onDown,
    onLeft,
    onRight,
    onSelect,
    onPlayPause,
    onChannelUp,
    onChannelDown,
    onMenu,
    onBack,
    enabled = true,
  } = handlers;

  useEffect(() => {
    if (!enabled) return;

    const handleKey = (key: TVRemoteKey) => {
      switch (key) {
        case "up":
          onUp?.();
          break;
        case "down":
          onDown?.();
          break;
        case "left":
          onLeft?.();
          break;
        case "right":
          onRight?.();
          break;
        case "select":
          onSelect?.();
          break;
        case "playPause":
          onPlayPause?.();
          break;
        case "channelUp":
          (onChannelUp ?? onUp)?.();
          break;
        case "channelDown":
          (onChannelDown ?? onDown)?.();
          break;
        case "menu":
          onMenu?.();
          break;
        case "rewind":
          onLeft?.();
          break;
        case "fastForward":
          onRight?.();
          break;
        case "back":
          onBack?.();
          break;
      }
    };

    if (Platform.OS === "web") {
      const onKeyDown = (e: KeyboardEvent) => {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        switch (e.code) {
          case "ArrowUp":
            e.preventDefault();
            handleKey("up");
            break;
          case "ArrowDown":
            e.preventDefault();
            handleKey("down");
            break;
          case "ArrowLeft":
            e.preventDefault();
            handleKey("left");
            break;
          case "ArrowRight":
            e.preventDefault();
            handleKey("right");
            break;
          case "Enter":
          case "NumpadEnter":
            handleKey("select");
            break;
          case "Space":
          case "MediaPlayPause":
            e.preventDefault();
            handleKey("playPause");
            break;
          case "PageUp":
            e.preventDefault();
            handleKey("channelUp");
            break;
          case "PageDown":
            e.preventDefault();
            handleKey("channelDown");
            break;
          case "ContextMenu":
          case "KeyG":
          case "KeyM":
            handleKey("menu");
            break;
          case "Escape":
          case "BrowserBack":
            handleKey("back");
            break;
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }

    // Native Android TV / Google TV via MainActivity dispatchKeyEvent -> DeviceEventEmitter
    const sub = DeviceEventEmitter.addListener("onTVKeyEvent", (keyName: TVRemoteKey) => {
      handleKey(keyName);
    });

    return () => {
      sub.remove();
    };
  }, [
    enabled,
    onUp,
    onDown,
    onLeft,
    onRight,
    onSelect,
    onPlayPause,
    onChannelUp,
    onChannelDown,
    onMenu,
    onBack,
  ]);
}
