import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, IBMPlexSans_400Regular, IBMPlexSans_500Medium } from '@expo-google-fonts/ibm-plex-sans';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { Feather } from '@expo/vector-icons';

import { AppProvider, AppContext } from './src/context/AppContext';
import EstateSelectScreen from './src/screens/EstateSelectScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import WorkScreen from './src/screens/WorkScreen';
import Toast from './src/components/Toast';
import { COLORS, FONTS } from './src/theme/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => {
          const iconName = route.name === 'Attendance' ? 'check-square' : 'briefcase';
          return <Feather name={iconName} size={18} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          backgroundColor: COLORS.white,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.sansMedium,
          fontSize: 11,
        },
      })}
    >
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Work" component={WorkScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { supervisorEstate } = useContext(AppContext);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      {supervisorEstate === null ? (
        <Stack.Screen name="EstateSelect" component={EstateSelectScreen} />
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

function MainApp() {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <Toast />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
