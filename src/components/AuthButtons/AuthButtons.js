import React, { useCallback } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Icons from "../Icons/Icons";
import { BASE_URL, GOOGLE_CLIENT_ID, FACEBOOK_APP_ID } from '@env';

WebBrowser.maybeCompleteAuthSession();

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

const TwitterButton = ({ promptAsync, title = "Sign In with X / Twitter" }) => (
  <SafeAreaView style={{ alignItems: "center", justifyContent: "center", marginVertical: '3%', marginTop: 0 }}>
    <TouchableOpacity
      style={{ backgroundColor: "#1DA1F2", width: "100%", padding: 10, borderRadius: 5, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
      onPress={promptAsync}
    >
      <View style={{ padding: 8, backgroundColor: "#FFF", borderRadius: 20, marginRight: '5%' }}>
        <Icons name="Twitter" />
      </View>
      <Text style={{ fontWeight: "bold", color: "white", fontSize: 17 }}>
        {title}
      </Text>
    </TouchableOpacity>
  </SafeAreaView>
);

const SocialAuthButton = ({ strategy, title, setLoading, setSocialToken, setAuthType }) => {
  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    const redirectUrl = AuthSession.makeRedirectUri({ useProxy: true });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=token&scope=openid%20profile%20email`;
    const response = await AuthSession.startAsync({ authUrl });
    if (response.type === 'success' && response.params.access_token) {
      setAuthType("google");
      setSocialToken(response.params.access_token);
    }
    setLoading(false);
  }, []);

  const handleFacebookSignIn = useCallback(async () => {
    setLoading(true);
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    const authUrl = `https://www.facebook.com/v10.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email,public_profile`;
    const response = await AuthSession.startAsync({ authUrl });
    if (response.type === 'success' && response.params.access_token) {
      setAuthType("facebook");
      setSocialToken(response.params.access_token);
    }
    setLoading(false);
  }, []);

  const handleTwitterSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const requestTokenUrl = `${BASE_URL}/api/users/auth/twitter/request_token`;
      const response = await fetch(requestTokenUrl);
      const { oauth_token } = await response.json();

      const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
      const result = await AuthSession.startAsync({ authUrl });

      if (result.type === 'success' && result.params.oauth_token && result.params.oauth_verifier) {
        setAuthType("twitter");
        setSocialToken(`oauth_token=${result.params.oauth_token}&oauth_verifier=${result.params.oauth_verifier}`);
      }
    } catch (error) {
      console.error('Error during Twitter login', error);
    } finally {
      setLoading(false);
    }
  }, []);


  if (strategy === "google") {
    return <GoogleButton promptAsync={handleGoogleSignIn} title={title} />;
  } else if (strategy === "facebook") {
    return <FacebookButton promptAsync={handleFacebookSignIn} title={title} />;
  } else if (strategy === "twitter") {
    return <TwitterButton promptAsync={handleTwitterSignIn} title={title} />;
  } else {
    return null;
  }
};

export default SocialAuthButton;
