import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { ChatProvider } from './src/utils/chats';

const App = () => {
  return (
    <ChatProvider>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="light-content" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ChatProvider>
  );
};

export default App;