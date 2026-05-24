import { registerRootComponent } from 'expo';
import React from 'react';
import App from './src/App';
import { PlansProvider } from './src/context/PlansContext';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
const Root = () => (
	<PlansProvider>
		<App />
	</PlansProvider>
);

registerRootComponent(Root);
