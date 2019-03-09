import document from "document";
import { peerSocket } from "messaging";
import clock from "clock";
import { messagesKeys } from "../common/constants"
import { sendMessage } from "../common/messages";

const trackInfoInterval = 5;  // sec

const notLoggedInText = document.getElementById("not-logged-in-text");
const mainCanvas = document.getElementById("main-canvas");
const nowPlayingTextEl = document.getElementById("now-playing");
const nowPlayingPlaceholderEl = document.getElementById("now-playing-placeholder");
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");
const nextButton = document.getElementById("nextButton");

const toggleElement = (el, show) => el.style.display = show ? "inline" : "none";

toggleElement(pauseButton, false);

// Message is received
peerSocket.onmessage = evt => {
  console.log(`App received: ${JSON.stringify(evt)}`);

  if (evt.data.key === messagesKeys.OAUTH_TOKEN) {
    const loggedIn = !!evt.data.newValue;
    toggleElement(notLoggedInText, !loggedIn);
    toggleElement(mainCanvas, loggedIn);
  }

  if (evt.data.key === messagesKeys.TRACK_INFO) {
    const trackInfo = evt.data.newValue;
    showTrackInfo(trackInfo);
    toggleElement(playButton, !trackInfo.isPlaying);
    toggleElement(pauseButton, trackInfo.isPlaying);
  }
};

// Message socket opens
peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
peerSocket.onclose = () => {
  console.log("App Socket Closed");
};

playButton.onclick = () => {
  sendMessage(messagesKeys.PLAY_PAUSE);
};

pauseButton.onclick = () => {
  sendMessage(messagesKeys.PLAY_PAUSE);
};

nextButton.onclick = () => {
  sendMessage(messagesKeys.NEXT_TRACK);
};

clock.granularity = "seconds";
clock.ontick = (evt) => {
  if (evt.date.getSeconds() % trackInfoInterval === 0) {
    sendMessage(messagesKeys.TRACK_INFO_REQUEST);
  }
};

function showTrackInfo(trackInfo) {
  if (!trackInfo.artist || !trackInfo.title) {
    toggleElement(nowPlayingTextEl, false);
    toggleElement(nowPlayingPlaceholderEl, true);
  } else {
    nowPlayingTextEl.text = trackInfo.artist + " - " + trackInfo.title;
    toggleElement(nowPlayingPlaceholderEl, false);
    toggleElement(nowPlayingTextEl, true);
  }
}
