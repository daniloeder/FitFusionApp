import "react-native-gesture-handler";
import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { SafeAreaView, Text, TouchableOpacity, Button, LogBox } from "react-native";
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@env";
import { auth } from "./firebase-config";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut
} from "firebase/auth";
LogBox.ignoreLogs(['The useProxy option is deprecated and will be removed in a future release, for more information check https://expo.fyi/auth-proxy-migration.']);

const GoogleSignInButton = ({ promptAsync }) => (
  <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <TouchableOpacity
      style={{ backgroundColor: "#4285F4", width: "90%", padding: 10, borderRadius: 15, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
      onPress={() => promptAsync()}
    >
      <Text style={{ fontWeight: "bold", color: "white", fontSize: 17 }}>
        Sign In with Google
      </Text>
    </TouchableOpacity>
  </SafeAreaView>
);

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLogin() {
  const [userInfo, setUserInfo] = React.useState();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    clientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({
      scheme: 'myapp', // Replace this with your app's custom scheme
    }),
    useProxy: false
  });

  const getLocalUser = async () => {
    try {
      const userData = userJSON ? JSON.parse(userJSON) : null;
      setUserInfo(userData);
    } catch (e) {
      console.log(e, "Error getting local user");
    }
  };

  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  React.useEffect(() => {
    getLocalUser();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(JSON.stringify(user, null, 2));
        setUserInfo(user);
      } else {
        console.log("user not authenticated");
      }
    });
    return () => unsub();
  }, []);

  if (!userInfo) {
      return <GoogleSignInButton promptAsync={promptAsync} />;
  } else {
    return <Button title="Sign Out" onPress={()=>signOut(auth)} />;
  }
}
