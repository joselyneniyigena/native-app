//android 1022904839892-i2rv4vmli8i5it55p9ne2qu3226f13vd.apps.googleusercontent.com
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './routes/DrawerNavigator';
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import{
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import SignInScreen from "./screens/SignInScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Button, View } from "react-native";
import React from 'react';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [userInfo, setUserInfor] = React.userState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "1022904839892-i2rv4vmli8i5it55p9ne2qu3226f13vd.apps.googleusercontent.com",
  });
  const getLocalUser = async () => {
    try {
      setLoading(true);
      const userJSON = await AsyncStorage.getItem("@user");
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
      const user = await AsyncStorage.getItem("@user");
      if (!user) {
        if (response?.type === "success") {
          await AsyncStorage.setItem("@user", JSON.stringify(user));
          console.log(JSON.stringify(user, null, 2));
          setUserInfo(user);
        }
      } else {
        setUserInfo(JSON.parse(user));

      }
    });
    return () => unsub();
  }, []);
  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user)); 
      setUserInfo(user); 
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  if (loading)
    return (
      <View style={StyleSheet.container}>
        <Text>{JSON.stringify(userInfo, null, 2)}</Text>
        <Button title="Sign in with Google" onPress={() => promptAsync()}/> 
        <Button title="delete local storage" onPress={() => AsyncStorage.removeItem("@user")}/>
      </View>
    );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems:"center",
    justifyContent:"center"
  }

});


