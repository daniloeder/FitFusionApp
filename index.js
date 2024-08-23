import { AppRegistry } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

if (!__DEV__) {
    AppRegistry.registerComponent('FitFusionApp', () => App);
} else {
    registerRootComponent(App);
}