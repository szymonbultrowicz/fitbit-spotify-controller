import { peerSocket } from "messaging";
import { settingsStorage } from "settings";

import { messagesKeys, settingsKeys } from "../common/constants";
import { sendMessage } from "../common/messages";

import { init as initOAuth } from "./oauth";
import { getCurrentTrack, nextTrack, playOrPause } from "./spotify";

initOAuth(settingsStorage);

// Message socket opens
peerSocket.onopen = () => {
  restoreSettings();
  sendTrackInfo();
};

peerSocket.onmessage = (evt) => {
  const key = evt.data.key;

  if (key === messagesKeys.PLAY_PAUSE) {
    playOrPause().catch((err) => {
      console.error("Failed to play/pause the current track");
      console.error(err);
    });
  }

  if (key === messagesKeys.NEXT_TRACK) {
    nextTrack()
      .then(() => sendTrackInfo())
      .catch((err) => {
        console.error("Failed to skip to the next track");
        console.error(err);
      });
  }

  if (key === messagesKeys.TRACK_INFO_REQUEST) {
    sendTrackInfo();
  }
};

// A user changes settings
settingsStorage.onchange = (evt) => {
  sendMessage(evt.key, evt.newValue);
};

// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    const key = settingsStorage.key(index);
    if (key) {
      sendMessage(key, settingsStorage.getItem(key));
    }
  }

  ensureSent(settingsKeys.OAUTH_TOKEN);
}

function ensureSent(key: string, defaultValue?: string) {
  if (settingsStorage.getItem(key) === null) {
    sendMessage(key, defaultValue);
  }
}

async function sendTrackInfo() {
  return getCurrentTrack()
    .then((trackInfo) => {
      sendMessage(messagesKeys.TRACK_INFO, JSON.stringify(trackInfo));
    })
    .catch((err) => {
      console.error("Failed to get current track info:", err.message || err);
    });
}
