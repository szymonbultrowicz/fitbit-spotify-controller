import { TrackInfo } from "../common/track-info";
import { fetchTokenByRefreshToken, getToken, isLoggedIn } from "./oauth";

const baseUrl = "https://api.spotify.com/v1/";

export interface SpotifyMe {
    display_name: string;
}

interface SpotifyArtist {
    name: string;
}

interface SpotifyPlayerItem {
    name: string;
    artists: SpotifyArtist[];
}

interface SpotifyPlayer {
    is_playing: boolean;
    item: SpotifyPlayerItem;
}

export async function getCurrentTrack() {
    return call<SpotifyPlayer>("me/player")
        .then(createTrackInfoData);
}

export async function playOrPause() {
    return getCurrentTrack()
        .then((track) => {
            if (track) {
                return track.isPlaying
                    ? call("me/player/pause", "PUT")
                    : call("me/player/play", "PUT");
            }
        });
}

export async function nextTrack() {
    return call("me/player/next", "POST");
}

export async function fetchUserName() {
    if (!isLoggedIn()) {
        return Promise.resolve("");
    }
    return call("me")
        .then((data: SpotifyMe) => data.display_name);
}

async function call<T>(path: string, method: string = "GET", retryNo = 0): Promise<T> {
    return fetch(baseUrl + path, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken(),
        },
    })
    .then((response) => {
        if (response.status === 401 && retryNo < 1) {
            return fetchTokenByRefreshToken()
                .then(() => call(path, method, retryNo + 1));
        }
        return response.status === 200 ? response.json() : undefined;
    });
}

function createTrackInfoData(spotifyData: SpotifyPlayer): TrackInfo {
    if (!spotifyData) {
        return {
            isPlaying: false,
        };
    }
    return {
      isPlaying: spotifyData.is_playing,
      artist: spotifyData.item.artists.map((a) => a.name).join(", "),
      title: spotifyData.item.name,
    };
  }
