import { settingsKeys } from "../common/constants";
import { aws as awsConfig } from "../config";

const INVALID_REFRESH_TOKEN = "Invalid refresh token";

class InvalidRefreshTokenError extends Error {}

let settingsStorage: LiveStorage;

// tslint:disable-next-line: variable-name
export function init(_settingsStorage: LiveStorage) {
    if (!settingsStorage) {
        settingsStorage = _settingsStorage;
    }
}

async function _fetchToken(param: string, value: string) {
    return fetch(awsConfig.URL + "?" + param + "=" + value, {
        headers: {
            Authorization: awsConfig.TOKEN,
        },
    })
        .then((response) => {
            if (response.status === 400) {
                return response.json()
                    .then((content) => {
                        if (content.message === INVALID_REFRESH_TOKEN) {
                            throw new InvalidRefreshTokenError(INVALID_REFRESH_TOKEN);
                        }
                        throw new Error(content.message);
                    });
            }
            if (response.status > 400) {
                return response.text()
                    .then((content) => {
                        throw new Error(content);
                    });
            }
            return response.json();
        })
        .then((tokenData) => {
            settingsStorage.setItem(settingsKeys.OAUTH_TOKEN, tokenData.access_token);
            settingsStorage.setItem(settingsKeys.OAUTH_REFRESH_TOKEN, tokenData.refresh_token);
        })
        .catch((err) => {
            console.error("Failed to fetch the token");
            if (err && err.message) {
                console.error("Error: " + err.message);
            } else {
                console.error("Error: " + err);
            }

            if (err instanceof InvalidRefreshTokenError) {
                settingsStorage.removeItem(settingsKeys.OAUTH_TOKEN);
                settingsStorage.removeItem(settingsKeys.OAUTH_REFRESH_TOKEN);
            }

            throw err;
        });
}

export async function fetchTokenByCode(code: string) {
    return _fetchToken("code", code);
}

export async function fetchTokenByRefreshToken(refreshToken?: string) {
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
