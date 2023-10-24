import "react-native-gesture-handler";
import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import jwtDecode from 'jwt-decode';
import * as Google from "expo-auth-session/providers/google";
import { SafeAreaView, Text, TouchableOpacity, Button, LogBox, View } from "react-native";
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@env";
import Icons from "../Icons/Icons";

LogBox.ignoreLogs(['The useProxy option is deprecated and will be removed in a future release, for more information check https://expo.fyi/auth-proxy-migration.']);

const GoogleSignInButton = ({ promptAsync, title = "Sign In with Google" }) => (

  <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", marginVertical: 10 }}>
    <TouchableOpacity
      style={{ backgroundColor: "#4285F4", width: "100%", padding: 10, borderRadius: 5, flexDirection: "row", alignItems: "center", justifyContent: "center", flexDirection: 'row' }}
      onPress={() => promptAsync()}
    >
      <View style={{ padding: 8, backgroundColor: "#FFF", borderRadius: 20, marginRight: '5%' }}>
        <Icons name="Google" />
      </View>
      <Text style={{ fontWeight: "bold", color: "white", fontSize: 17 }}>
        {title}
      </Text>
    </TouchableOpacity>
  </SafeAreaView>
);


WebBrowser.maybeCompleteAuthSession();

export default function GoogleLogin({ title, setGoogleToken, setGoogleData, setIsSocialLogin, registration = false }) {
  const [authToken, setAuthToken] = React.useState(null);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    clientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      setGoogleToken(id_token);
      const decodedToken = jwtDecode(id_token);
      setGoogleData(decodedToken);
      if (registration) {
        setIsSocialLogin(true);
      }
    }
  }, [response]);

  if (!authToken) {
    return <GoogleSignInButton promptAsync={promptAsync} title={title} />;
  } else {
    return <Button title="Sign Out" onPress={handleSignOut} />;
  }
}