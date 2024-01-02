import * as React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Icons from "../Icons/Icons";

const FacebookLogin = ({ title = "Sign In with Facebook" }) => (
  <SafeAreaView style={{ alignItems: "center", justifyContent: "center", marginVertical: '15%', marginTop: 0 }}>
    <TouchableOpacity
      style={{ backgroundColor: "#4267B2", width: "100%", padding: 10, borderRadius: 5, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
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

export default FacebookLogin;
