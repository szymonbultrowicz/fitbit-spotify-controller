import { settingsStorage } from "settings";
import { keys as settingsKeys } from "../settings/constants";

const baseUrl = "https://api.spotify.com/v1/";

export async function getCurrentTrack() {
    return call("me/player");
}

async function call(path) {
    return fetch(baseUrl + path, {
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
