import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { keys } from "../settings/constants";
import { keys as messageKeys } from "../communication/messages"
import { getCurrentTrack, playOrPause, nextTrack } from "./spotify";

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  restoreSettings();
  sendTrackInfo();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

messaging.peerSocket.onmessage = evt => {
  console.log(`Companion received: ${JSON.stringify(evt)}`);

  if (evt.data.key === messageKeys.PLAY_PAUSE) {
    console.log("Got request to play/pause");
    playOrPause()
      .catch(err => {
        console.error("Failed to play/pause the current track");
        console.error(err);
      });
  }

  if (evt.data.key === messageKeys.NEXT_TRACK) {
    console.log("Got next track request");
    nextTrack()
      .catch(err => {
        console.error("Failed to skip to the next track");
        console.error(err);
      });
  }
};

// A user changes settings
settingsStorage.onchange = evt => {
  let data = {
    key: evt.key,
    newValue: evt.newValue
  };
  sendVal(data);
};

// Restore any previously saved settings and send to the device
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key) {
      sendVal(createSettingsEntry(
        key, settingsStorage.getItem(key)
      ));
    }
  }

  ensureSent(keys.OAUTH_TOKEN);
}

function createSettingsEntry(key, newValue) {
  return {
    key,
    newValue,
  };
}

// Send data to device using Messaging API
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

function ensureSent(key, defaultValue) {
  if (settingsStorage.getItem(key) === null) {
    sendVal(createSettingsEntry(
      key,
      defaultValue,
    ));
  }
}

async function sendTrackInfo() {
  return getCurrentTrack()
    .then((data) => {
      sendVal(createSettingsEntry(
        messageKeys.TRACK_INFO, 
        createTrackInfoData(data),
      ));
    })
    .catch((err) => {
      console.error("Failed to get current track info")
      console.log(err);
    });
}

function createTrackInfoData(spotifyData) {
  return {
    isPlaying: spotifyData.is_playing,
    artist: spotifyData.item.artists.map(a => a.name).join(", "),
    title: spotifyData.item.name,
  }
}
