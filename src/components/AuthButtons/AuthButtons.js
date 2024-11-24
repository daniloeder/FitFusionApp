import React, { useCallback, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Icons from "../Icons/Icons";
import { BASE_URL, REDIRECT_URL, GOOGLE_CLIENT_ID, FACEBOOK_APP_ID } from '@env';

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

function parseQueryParams(url) {
  const queryParams = {};
  const queryString = url.split('?')[1] || url;
  if (queryString) {
    const pairs = queryString.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      queryParams[decodeURIComponent(key)] = decodeURIComponent(value);
    });
  }
  return queryParams;
}


const SocialAuthButton = ({ strategy, title, setLoading, setSocialToken, setAuthType }) => {
  useEffect(() => {
    const handleOpenURL = (event) => {
      const url = event.url;
      if (url) {
        const queryParams = parseQueryParams(url);
        if (queryParams.provider === "google") {
          setSocialToken(queryParams.access_token);
        } else if (queryParams.provider === "facebook") {
          setSocialToken(queryParams.access_token);
        } else if (queryParams.provider === "twitter") {
          setSocialToken(`oauth_token=${queryParams.oauth_token}&oauth_verifier=${queryParams.oauth_verifier}`);
        }
        setAuthType(null);
      }
    };

    const subscription = Linking.addListener('url', handleOpenURL);

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    const redirectUri = `${REDIRECT_URL}?provider=google`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20profile%20email`;
    const response = await WebBrowser.openBrowserAsync(authUrl);
    setAuthType("google");
    setLoading(false);
  }, []);

  const handleFacebookSignIn = useCallback(async () => {
    setLoading(true);
    const redirectUri = `${REDIRECT_URL}?provider=facebook`;
    const authUrl = `https://www.facebook.com/v10.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email,public_profile`;
    const result = await WebBrowser.openBrowserAsync(authUrl);
    setAuthType("facebook");
    setLoading(false);
  }, []);

  const handleTwitterSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const requestTokenUrl = `${BASE_URL}/api/users/auth/twitter/request_token`;
      const response = await fetch(requestTokenUrl);
      if (response.ok) {
        const { oauth_token } = await response.json();
        if (oauth_token) {
          const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;

          const result = await WebBrowser.openBrowserAsync(authUrl);
          setAuthType("twitter");
        }
      }

    } catch (error) {
      console.error('Error during Twitter login', error);
    }
    setLoading(false);
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
