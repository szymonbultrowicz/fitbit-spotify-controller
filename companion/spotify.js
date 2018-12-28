import { settingsStorage } from "settings";
import { keys as settingsKeys } from "../settings/constants";

const baseUrl = "https://api.spotify.com/v1/";

export async function getCurrentTrack() {
    return call("me/player");
}

export async function playOrPause() {
    return getCurrentTrack()
        .then(track => {
            if (track) {
                return track.is_playing
                    ? call("me/player/pause", "PUT")
                    : call("me/player/play", "PUT");
            }
        }); 
}

export async function nextTrack() {
    return call("me/player/next", "POST");
}

async function call(path, method = "GET") {
    return fetch(baseUrl + path, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getToken()
        },
    })
    .then(response => 
        response.status === 200 ? response.json() : undefined
    );
}

function getToken() {
    return settingsStorage.getItem(settingsKeys.OAUTH_TOKEN);
}
