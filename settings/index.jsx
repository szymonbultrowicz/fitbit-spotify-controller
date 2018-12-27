import { keys } from "./constants"
import { spotify as spotifyConfig } from "../config";

function mySettings(props) {
  const isLoggedIn = () => !!props.settingsStorage.getItem(keys.OAUTH_TOKEN);

  return (
    <Page>
      <Section
        title={<Text bold align="center">Spotify account</Text>}>
        <Oauth
          settingsKey="oauth"
          label={isLoggedIn() ? "Logged in" : "Login"}
          status={props.settingsStorage.getItem(keys.OAUTH_TOKEN)}
          authorizeUrl="https://accounts.spotify.com/authorize"
          requestTokenUrl="https://accounts.spotify.com/api/token"
          clientId={spotifyConfig.CLIENT_ID}
          clientSecret={spotifyConfig.CLIENT_SECRET}
          scope="user-modify-playback-state,user-read-playback-state"
          oAuthParams={{ response_type: "token" }}
          onReturn={async (data) => {
            console.log(JSON.stringify(data));
            props.settingsStorage.setItem(keys.OAUTH_TOKEN, data.access_token);
          }}
        />

        {isLoggedIn() &&
          <Button
            label="Log out"
            onClick={() => props.settingsStorage.removeItem(keys.OAUTH_TOKEN)}
          />
        }
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
