import { settingsKeys } from "../common/constants";

import { fetchTokenByCode, init as initOAuth, isLoggedIn } from "../companion/oauth";
import { fetchUserName } from "../companion/spotify";

import { spotify as spotifyConfig } from "../config";

function mySettings(props: SettingsComponentProps) {
  initOAuth(props.settingsStorage);
  console.log(props.settingsStorage.getItem(settingsKeys.OAUTH_TOKEN));

  return (
    <Page>
      <Section
        title={<Text bold align="center">Spotify account</Text>}>
        <Oauth
          settingsKey="oauth"
          label={isLoggedIn() ? "Logged in" : "Login"}
          status={isLoggedIn() ? props.settingsStorage.getItem(settingsKeys.SPOTIFY_USERNAME) : ""}
          authorizeUrl="https://accounts.spotify.com/authorize"
          requestTokenUrl="https://accounts.spotify.com/api/token"
          clientId={spotifyConfig.CLIENT_ID}
          clientSecret={spotifyConfig.CLIENT_SECRET}
          scope="user-modify-playback-state,user-read-playback-state"
          onReturn={async (data) => {
              fetchTokenByCode(data.code)
                .then(() => fetchUserName())
                .then(username => props.settingsStorage.setItem(settingsKeys.SPOTIFY_USERNAME, username));
            }
          }
        />

        {isLoggedIn() &&
          <Button
            label="Log out"
            onClick={() => props.settingsStorage.removeItem(settingsKeys.OAUTH_TOKEN)}
          />
        }
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
