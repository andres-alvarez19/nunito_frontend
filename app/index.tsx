import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/contexts/AuthContext";
import { NotificationProvider } from "../src/contexts/NotificationContext";
import { ToastContainer } from "../src/components";
import HomeScreen from "../src/features/home/screens/HomeScreen";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NotificationProvider>
          <AuthProvider>
            <HomeScreen />
            <ToastContainer />
          </AuthProvider>
        </NotificationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
