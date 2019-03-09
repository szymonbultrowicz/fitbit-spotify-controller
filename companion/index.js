import { peerSocket } from "messaging";
import { settingsStorage } from "settings";
import { settingsKeys, messagesKeys } from "../common/constants";
import { getCurrentTrack, playOrPause, nextTrack } from "./spotify";
import { sendMessage } from "../common/messages";
import { init as initOAuth } from "./oauth";

initOAuth(settingsStorage);

// Message socket opens
peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  restoreSettings();
  sendTrackInfo();
};

// Message socket closes
peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

peerSocket.onmessage = evt => {
  console.log(`Companion received: ${JSON.stringify(evt)}`);
  const key = evt.data.key;

  if (key === messagesKeys.PLAY_PAUSE) {
    console.log("Got request to play/pause");
    playOrPause()
      .catch(err => {
        console.error("Failed to play/pause the current track");
        console.error(err);
      });
  }

  if (key === messagesKeys.NEXT_TRACK) {
    console.log("Got next track request");
    nextTrack()
      .then(() => sendTrackInfo())
      .catch(err => {
        console.error("Failed to skip to the next track");
        console.error(err);
      });
  }

  if (key === messagesKeys.TRACK_INFO_REQUEST) {
    console.log("Got track info request");
    sendTrackInfo();
  }
};

// A user changes settings
settingsStorage.onchange = evt => {
  console.log("sending message " + evt.key + " - " + evt.newValue);
  sendMessage(evt.key, evt.newValue);
};


// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key) {
      sendMessage(key, settingsStorage.getItem(key));
    }
  }

  ensureSent(settingsKeys.OAUTH_TOKEN);
}

function ensureSent(key, defaultValue) {
  if (settingsStorage.getItem(key) === null) {
    sendMessage(key, defaultValue);
  }
}

async function sendTrackInfo() {
  return getCurrentTrack()
    .then((trackInfo) => {
      sendMessage(
        messagesKeys.TRACK_INFO, 
        trackInfo,
      );
    })
    .catch((err) => {
      console.error("Failed to get current track info:", err.message || err);
    });
}
