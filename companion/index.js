import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { keys } from "../settings/constants";
import { keys as messageKeys } from "../communication/messages"
import { getCurrentTrack } from "./spotify";

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
