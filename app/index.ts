import clock from "clock";
import document from "document";
import { peerSocket } from "messaging";
import { messagesKeys } from "../common/constants";
import { sendMessage } from "../common/messages";
import { TrackInfo } from "../common/track-info";

const trackInfoInterval = 5; // sec

const getElementById = (id: string) =>
  document.getElementById(id) as GraphicsElement;

const notLoggedInText = getElementById("not-logged-in-text");
const mainCanvas = getElementById("main-canvas");
const nowPlayingTextEl = getElementById("now-playing");
const nowPlayingPlaceholderEl = getElementById("now-playing-placeholder");
const playButton = getElementById("playButton");
const pauseButton = getElementById("pauseButton");
const nextButton = getElementById("nextButton");

const toggleElement = (el: GraphicsElement, show: boolean) =>
  (el.style.display = show ? "inline" : "none");

toggleElement(pauseButton, false);

// Message is received
peerSocket.onmessage = (evt) => {
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

function showTrackInfo(trackInfo: TrackInfo) {
  if (!trackInfo.artist || !trackInfo.title) {
    toggleElement(nowPlayingTextEl, false);
    toggleElement(nowPlayingPlaceholderEl, true);
  } else {
    nowPlayingTextEl.text = trackInfo.artist + " - " + trackInfo.title;
    toggleElement(nowPlayingPlaceholderEl, false);
    toggleElement(nowPlayingTextEl, true);
  }
}
