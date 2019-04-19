export const settingsKeys = {
  OAUTH_TOKEN: "oauthAccessToken",
  OAUTH_REFRESH_TOKEN: "oauthRefreshToken",
  SPOTIFY_USERNAME: "spotifyUsername",
};

export const messagesKeys = {
  ...settingsKeys,
  TRACK_INFO: "trackInfo",
  TRACK_INFO_REQUEST: "trackInfoRequest",
  PLAY_PAUSE: "playOrPause",
  NEXT_TRACK: "nextTrack",
};
