import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Linking,
  Image,
} from "react-native";
import tw from "twrnc";
import { Colors, Spacing, BorderRadius, Shadows } from "../constants/Colors";

const { width: screenWidth } = Dimensions.get("window");

export default function AppInformationModal({ visible, onClose }) {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 6,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const features = [
    "Receipt scanning & storage",
    "Expense categorization",
    "Data export & backup",
    "Multi-Currency support",
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          tw`flex-1 justify-center items-center`,
          {
            backgroundColor: Colors.light.overlay,
            opacity: opacityAnim,
          },
        ]}
      >
        <Animated.View
          style={{
            width: screenWidth * 0.9,
            maxWidth: 380,
            backgroundColor: Colors.light.card,
            borderRadius: BorderRadius.xl,
            padding: Spacing.lg,
            ...Shadows.lg,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* App Logo & Name */}
          <View style={tw`items-center mb-4`}>
            <View
              style={[
                tw`rounded-full mb-3`,
                { backgroundColor: Colors.light.secondary },
              ]}
            >
              <Image
                source={require("../assets/images/logoo.png")}
                style={{ width: 70, height: 70, borderRadius:50 }}
              />
            </View>
            <Text style={[tw`text-xl font-bold`, { color: Colors.light.text }]}>
              ScanVault
            </Text>
            <Text
              style={[tw`text-sm mt-1`, { color: Colors.light.textSecondary }]}
            >
              Track & manage receipts effortlessly
            </Text>
            <Text
              style={[
                tw`text-xs mt-0.5`, // smaller size & tighter spacing
                { color: Colors.light.textSecondary, opacity: 0.8 },
              ]}
            >
              Version 1.0.0
            </Text>
          </View>

          {/* Features */}
          <View style={tw`mb-5`}>
            {features.map((f, i) => (
              <View key={i} style={tw`flex-row items-center mb-2`}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={Colors.light.success}
                  style={tw`mr-2`}
                />
                <Text style={[tw`text-sm`, { color: Colors.light.text }]}>
                  {f}
                </Text>
              </View>
            ))}
          </View>

          {/* Contact */}
          <TouchableOpacity
            onPress={() => Linking.openURL("mailto:heygopal67@gmail.com")}
            activeOpacity={0.7}
            style={tw`flex-row items-center mb-5`}
          >
            <Ionicons
              name="mail"
              size={18}
              color={Colors.light.primary}
              style={tw`mr-2`}
            />
            <Text
              style={[tw`text-sm underline`, { color: Colors.light.primary }]}
            >
              heygopal67@gmail.com
            </Text>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity
            style={[
              tw`rounded-lg py-3 items-center`,
              { backgroundColor: Colors.light.primary, ...Shadows.sm },
            ]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[tw`text-white font-semibold text-base`]}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
