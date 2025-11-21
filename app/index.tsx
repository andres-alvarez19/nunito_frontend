import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "../src/features/home/screens/HomeScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  );
}
