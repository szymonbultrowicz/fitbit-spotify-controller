import document from "document";
import * as messaging from "messaging";
import { keys as settingsKeys } from "../settings/constants";

const notLoggedInText = document.getElementById("not-logged-in-text");
const mainCanvas = document.getElementById("main-canvas");

const toggleElement = (el, show) => el.style.display = show ? "inline" : "none";

// Message is received
messaging.peerSocket.onmessage = evt => {
  console.log(`App received: ${JSON.stringify(evt)}`);

  if (evt.data.key === settingsKeys.OAUTH_TOKEN) {
    const loggedIn = !!evt.data.newValue;
    toggleElement(notLoggedInText, !loggedIn);
    toggleElement(mainCanvas, loggedIn);
  }
};

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
};