// App.js
import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// screens
import SearchScreen from "./src/screens/SearchScreen";
import DetailsScreen from "./src/screens/DetailsScreen";
import CompareScreen from "./src/screens/CompareScreen";
import SavedScreen from "./src/screens/SavedScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="SearchHome"
        component={SearchScreen}
        options={{ title: "Medwise" }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ title: "Alternatives & Details" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: "#ffffff" },
  };

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#2f5ef2",
          tabBarInactiveTintColor: "#98a2b3",
          tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
          tabBarIcon: ({ focused, color }) => {
            let name = "ellipse";
            if (route.name === "Search") {
              name = focused ? "search" : "search-outline";
            } else if (route.name === "Compare") {
              // Ionicons doesn't have an outline variant for this; use the same for both states
              name = "git-compare";
            } else if (route.name === "Saved") {
              name = focused ? "heart" : "heart-outline";
            } else if (route.name === "Settings") {
              name = focused ? "settings" : "settings-outline";
            }
            return <Ionicons name={name} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Search" component={SearchStack} />
        <Tab.Screen name="Compare" component={CompareScreen} />
        <Tab.Screen name="Saved" component={SavedScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
