import "react-native-gesture-handler";
import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { SafeAreaView, Text, TouchableOpacity, Button, View } from "react-native";
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@env";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { auth } from "./firebase-config";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut
} from "firebase/auth";

const SignInScreen = ({ promptAsync }) => <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
  <TouchableOpacity style={{ backgroundColor: "#4285F4", width: "90%", padding: 10, borderRadius: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 15, marginTop: 80, marginBottom: 150, }} onPress={() => promptAsync()}>
    <Text style={{ fontWeight: "bold", color: "white", fontSize: 17 }}>
      Sign In with Google
    </Text>
  </TouchableOpacity>
</SafeAreaView>


WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [userInfo, setUserInfo] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    clientId: GOOGLE_WEB_CLIENT_ID,
  });

  const getLocalUser = async () => {
    try {
      setLoading(true);
      const userData = userJSON ? JSON.parse(userJSON) : null;
      setUserInfo(userData);
    } catch (e) {
      console.log(e, "Error getting local user");
    } finally {
      setLoading(false);
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

  return userInfo ?
    <View style={{ marginTop: 200 }}>
      <Button
        title="Sign Out"
        onPress={async () => {
          await signOut(auth);
        }}
      />
    </View>
    : <SignInScreen promptAsync={promptAsync} />;
}
