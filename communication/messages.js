import { keys as settingsKeys } from "../settings/constants";

export const keys = {
    ...settingsKeys,
    TRACK_INFO: "trackInfo",
    PLAY_PAUSE: "playOrPause",
    NEXT_TRACK: "nextTrack",
};

export const createMessage = (key, newValue) => ({
    key,
    newValue,
})
