import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import CustomTabBar from "../components/CustomTabBar";
import { Colors } from "../constants/Colors";

// Import screens
import AddReceiptTab from "../app/(tabs)/add-receipt";
import CategoriesTab from "../app/(tabs)/categories";
import HomeTab from "../app/(tabs)/home";
import ReceiptsTab from "../app/(tabs)/receipts";
import SettingsTab from "../app/(tabs)/settings";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: Colors.light.primary,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: Colors.light.card,
          fontWeight: "700",
          fontSize: 20,
        },
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerLeftContainerStyle: {
          paddingLeft: 16,
        },
        headerRightContainerStyle: {
          paddingRight: 16,
        },
      })}
    >
      <Tab.Screen
        name="home"
        component={HomeTab}
        options={{
          title: "Dashboard",
        }}
      />
      <Tab.Screen
        name="add-receipt"
        component={AddReceiptTab}
        options={{
          title: "Add Receipt",
        }}
      />
      <Tab.Screen
        name="receipts"
        component={ReceiptsTab}
        options={{
          title: "Receipts",
        }}
      />
      <Tab.Screen
        name="categories"
        component={CategoriesTab}
        options={{
          title: "Categories",
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsTab}
        options={{
          title: "Settings",
        }}
      />
    </Tab.Navigator>
  );
}
