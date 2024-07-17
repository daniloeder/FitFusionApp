import React, { useCallback } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth, useClerk } from '@clerk/clerk-expo';
import Icons from "../Icons/Icons";

WebBrowser.maybeCompleteAuthSession();

const Stack = createStackNavigator();

const useWarmUpBrowser = () => {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

const GoogleButton = ({ promptAsync, title = "Sign In with Google" }) => (
  <SafeAreaView style={{ alignItems: "center", justifyContent: "center", marginVertical: '3%' }}>
    <TouchableOpacity
      style={{ backgroundColor: "#FFF", width: "100%", padding: 10, borderRadius: 5, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
      onPress={promptAsync}
    >
      <View style={{ padding: 8, backgroundColor: "#EEE", borderRadius: 20, marginRight: '5%' }}>
        <Icons name="Google" />
      </View>
      <Text style={{ fontWeight: "bold", color: "#4285F4", fontSize: 17 }}>
        {title}
      </Text>
    </TouchableOpacity>
  </SafeAreaView>
);

const FacebookButton = ({ promptAsync, title = "Sign In with Facebook" }) => (
  <SafeAreaView style={{ alignItems: "center", justifyContent: "center", marginVertical: '3%', marginTop: 0 }}>
    <TouchableOpacity
      style={{ backgroundColor: "#4267B2", width: "100%", padding: 10, borderRadius: 5, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
      onPress={promptAsync}
    >
      <View style={{ padding: 8, backgroundColor: "#FFF", borderRadius: 20, marginRight: '5%' }}>
        <Icons name="Facebook" />
      </View>
      <Text style={{ fontWeight: "bold", color: "white", fontSize: 17 }}>
        {title}
      </Text>
    </TouchableOpacity>
  </SafeAreaView>
);

const TiktokButton = ({ promptAsync, title = "Sign In with TikTok" }) => (
  <SafeAreaView style={{ alignItems: "center", justifyContent: "center", marginVertical: '3%', marginTop: 0 }}>
    <TouchableOpacity
      style={{ backgroundColor: "#000", width: "100%", padding: 10, borderRadius: 5, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
      onPress={promptAsync}
    >
      <View style={{ padding: 8, backgroundColor: "#FFF", borderRadius: 20, marginRight: '5%' }}>
        <Icons name="TikTok" size={18} />
      </View>
      <Text style={{ fontWeight: "bold", color: "white", fontSize: 17 }}>
        {title}
      </Text>
    </TouchableOpacity>
  </SafeAreaView>
);

const SocialAuthButton = ({ strategy, title, setLoading, setSocialToken }) => {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: strategy });
  const { signOut } = useClerk();

  const onPress = useCallback(async () => {
    setLoading(true);
    const { createdSessionId } = await startOAuthFlow({
      redirectUrl: Linking.createURL("/", { scheme: "fitfusionapp" })
    });

    if (createdSessionId) {
      setSocialToken(createdSessionId);
      setTimeout(() => {
        signOut();
      }, 10000);
    }
  }, [startOAuthFlow]);

  if (strategy === "oauth_google") {
    return <GoogleButton promptAsync={onPress} title={title} />;
  } else if (strategy === "oauth_facebook") {
    return <FacebookButton promptAsync={onPress} title={title} />;
  } else if (strategy === "oauth_tiktok") {
    return <TiktokButton promptAsync={onPress} title={title} />;
  } else {
    return null;
  }
}

export default SocialAuthButton;