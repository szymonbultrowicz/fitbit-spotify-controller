import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { keys } from "../settings/constants";

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
  restoreSettings();
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