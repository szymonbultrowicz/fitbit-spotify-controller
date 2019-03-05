import { fetchTokenByRefreshToken, getToken, isLoggedIn } from "./oauth";

const baseUrl = "https://api.spotify.com/v1/";

export async function getCurrentTrack() {
    return call("me/player")
        .then(createTrackInfoData);
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

export async function fetchUserName() {
    console.log("fetchUserName");
    if (!isLoggedIn()) {
        return Promise.resolve("");
    }
    console.log("calling me");
    return call("me")
        .then(data => {
            console.log("ME", data);
            return data;
        })
        .then(data => data.id);
}

async function call(path, method = "GET", retryNo = 0) {
    return fetch(baseUrl + path, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getToken(),
        },
    })
    .then(response => {
        console.log(response.status);
        if (response.status === 401 && retryNo < 1) {
            console.log("Unauthorized, attempt to get new access token: " + (retryNo + 1));
            return fetchTokenByRefreshToken()
                .then(() => call(path, method, retryNo + 1));
        }
        return response.status === 200 ? response.json() : undefined;
    });
}

function createTrackInfoData(spotifyData) {
    if (!spotifyData) {
        return {
            isPlaying: false,
        }
    }
    return {
      isPlaying: spotifyData.is_playing,
      artist: spotifyData.item.artists.map(a => a.name).join(", "),
      title: spotifyData.item.name,
    }
  }
  