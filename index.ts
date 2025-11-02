import { registerRootComponent } from 'expo';

// Start the app from `app/index.tsx` so the app's index route is used as the
// root component. This makes the app entry explicit and avoids accidental
// use of `App.tsx` when we want `app/index.tsx` to be the start screen.
import App from './app/index';

registerRootComponent(App);
