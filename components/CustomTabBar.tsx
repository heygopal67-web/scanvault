import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import tw from "twrnc";
import { Colors } from "../constants/Colors";

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const tabItems: TabItem[] = [
  { name: "home", icon: "home-outline", label: "Home" },
  { name: "add-receipt", icon: "add-circle-outline", label: "Add" },
  { name: "receipts", icon: "receipt-outline", label: "Receipts" },
  { name: "categories", icon: "pricetag-outline", label: "Categories" },
  { name: "settings", icon: "settings-outline", label: "Settings" },
];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const currentRoute = state.routes[state.index];

  return (
    <View
      style={[
        tw`absolute bottom-0 left-0 right-0 flex-row items-center justify-between px-6 py-4 mx-4 mb-6 rounded-full`,
        {
          backgroundColor: Colors.light.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        },
      ]}
    >
      {tabItems.map((item, index) => {
        const isActive = currentRoute.name === item.name;

        return (
          <TouchableOpacity
            key={item.name}
            onPress={() => navigation.navigate(item.name)}
            style={tw`items-center justify-center`}
          >
            {isActive ? (
              // Active tab with pill background
              <View
                style={[
                  tw`flex-row items-center px-4 py-2.5 rounded-full`,
                  {
                    backgroundColor: Colors.light.primary,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={Colors.light.card}
                />
                <Text
                  style={[
                    tw`ml-2 text-sm font-semibold`,
                    { color: Colors.light.card },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            ) : (
              // Inactive tab with just icon
              <View style={tw`p-2`}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={Colors.light.textSecondary}
                />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
