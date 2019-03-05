import { settingsKeys } from "../common/constants";
import { aws as awsConfig } from "../config";

const INVALID_REFRESH_TOKEN = "Invalid refresh token";

class InvalidRefreshTokenError extends Error {}

let settingsStorage;

export function init(_settingsStorage) {
    if (!settingsStorage) {
        settingsStorage = _settingsStorage;
    }
}

async function _fetchToken(param, value) {
    return fetch(awsConfig.URL + "?" + param + "=" + value, {
        headers: {
            Authorization: awsConfig.TOKEN,
        },
    })
        .then(response => {
            console.log(response.status);
            if (response.status === 400) {
                return response.json()
                    .then(content => {
                        if (content.message === INVALID_REFRESH_TOKEN) {
                            throw new InvalidRefreshTokenError(INVALID_REFRESH_TOKEN);
                        }
                        throw new Error(content.message);
                    });
            }
            if (response.status > 400) {
                return response.text()
                    .then(content => {
                        throw new Error(content);
                    });
            }
            return response.text();
        })
        .then(tokenData => {
            settingsStorage.setItem(settingsKeys.OAUTH_TOKEN, tokenData.access_token);
            settingsStorage.setItem(settingsKeys.OAUTH_REFRESH_TOKEN, tokenData.refresh);
        })
        .catch(err => {
            console.error("Failed to fetch the token");
            if (err && err.message) {
                console.error("Error:", err.message);
            } else {
                console.error("Error: " + err);
            }

            if (err instanceof InvalidRefreshTokenError) {
                console.log("Clearing old tokens");
                settingsStorage.removeItem(settingsKeys.OAUTH_TOKEN);
                settingsStorage.removeItem(settingsKeys.OAUTH_REFRESH_TOKEN);
            }

            throw err;
        });
}

export async function fetchTokenByCode(code) {
    console.log("fetchTokenByCode");
    return _fetchToken("code", code);
}

export async function fetchTokenByRefreshToken(refreshToken = undefined) {
    if (!refreshToken) {
        refreshToken = settingsStorage.getItem(settingsKeys.OAUTH_REFRESH_TOKEN);
    }
    if (!refreshToken) {
        return Promise.reject("Empty refresh token. Please log in");
    }
    return _fetchToken("refresh_token", refreshToken);
}

export function isLoggedIn() {
    return !!getToken();
}

export function getToken() {
    return settingsStorage.getItem(settingsKeys.OAUTH_TOKEN);
}
