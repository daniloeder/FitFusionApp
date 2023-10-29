import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';

const MainStack = createStackNavigator();

const MainNavigator = () => (
  <MainStack.Navigator initialRouteName="TabNavigator" screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Tabs" component={TabNavigator} />
      <MainStack.Screen name="Auth" component={AuthNavigator} />
  </MainStack.Navigator>
);


export default MainNavigator;
