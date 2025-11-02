import HomeScreen from '@/features/home/screens/HomeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  );
}
