import { settingsKeys } from "../common/constants"
import { spotify as spotifyConfig, aws as awsConfig } from "../config";

function mySettings(props) {
  const isLoggedIn = () => !!props.settingsStorage.getItem(settingsKeys.OAUTH_TOKEN);

  return (
    <Page>
      <Section
        title={<Text bold align="center">Spotify account</Text>}>
        <Oauth
          settingsKey="oauth"
          label={isLoggedIn() ? "Logged in" : "Login"}
          status={props.settingsStorage.getItem(settingsKeys.OAUTH_TOKEN)}
          authorizeUrl="https://accounts.spotify.com/authorize"
          requestTokenUrl="https://accounts.spotify.com/api/token"
          clientId={spotifyConfig.CLIENT_ID}
          clientSecret={spotifyConfig.CLIENT_SECRET}
          scope="user-modify-playback-state,user-read-playback-state"
          onReturn={async (data) => {
            fetch(awsConfig.URL + "?code=" + data.code, {
              headers: {
                Authorization: awsConfig.TOKEN,
              },
            })
              .then(response => response.json())
              .then(tokenData => {
                console.log(JSON.stringify(tokenData));
                props.settingsStorage.setItem(settingsKeys.OAUTH_TOKEN, tokenData.access_token);
              })
              .catch(err => {
                console.error("Failed to fetch the token");
                console.error(JSON.stringify(err));
              });
          }}
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
