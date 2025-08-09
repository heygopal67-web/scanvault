import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";
import {
  AnimatedButton,
  AnimatedCard,
  AnimatedFadeIn,
  AnimatedSlideIn,
} from "../components/AnimatedComponents";
import { AsyncImage } from "../components/AsyncImage";

import { Colors } from "../constants/Colors";
import { useApp } from "../context/AppContext";
import { Receipt } from "../storage/receiptStorage";
import {
  formatCurrency,
  formatDate,
  getRecentReceipts,
} from "../utils/helpers";


export default function HomeScreen() {
  const { state, loadReceipts } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const recentReceipts = getRecentReceipts(state.receipts, 5);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReceipts();
    setRefreshing(false);
  };

  const handleReceiptPress = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
  };

  const InfoRow = ({ label, value, valueStyle }) => (
    <View>
      <Text style={[tw`text-xs text-gray-500 mb-1`]}>
        {label.toUpperCase()}
      </Text>
      <Text style={[tw`text-base text-gray-900`, valueStyle]}>{value}</Text>
    </View>
  );

  const renderReceiptItem = (receipt: Receipt, index: number) => (
    <AnimatedSlideIn
      key={receipt.id}
      direction="left"
      delay={index * 100}
      duration={400}
    >
      <AnimatedCard
        onPress={() => handleReceiptPress(receipt)}
        style={{
          marginBottom: 10,
          paddingVertical: 14,
          paddingHorizontal: 16,
          backgroundColor: Colors.light.card,
          borderColor: Colors.light.borderPrimary,
          borderRadius: 14,
        }}
      >
        <View style={tw`flex-row justify-between items-center`}>
          {/* Left Section */}
          <View style={tw`flex-1 pr-4`}>
            <Text
              style={[
                tw`text-base font-semibold`,
                { color: Colors.light.text },
              ]}
              numberOfLines={1}
            >
              {receipt.vendor}
            </Text>
            <Text
              style={[tw`text-xs mt-1`, { color: Colors.light.textSecondary }]}
            >
              {formatDate(receipt.date)}
            </Text>

            {/* Tags */}
            {receipt.tags.length > 0 && (
              <View style={tw`flex-row flex-wrap mt-2`}>
                {receipt.tags.slice(0, 2).map((tag, idx) => (
                  <View
                    key={idx}
                    style={[
                      tw`px-2 py-0.5 rounded-full mr-2 mb-1`,
                      { backgroundColor: Colors.light.secondary },
                    ]}
                  >
                    <Text style={[tw`text-xs`, { color: Colors.light.card }]}>
                      {tag}
                    </Text>
                  </View>
                ))}
                {receipt.tags.length > 2 && (
                  <Text
                    style={[tw`text-xs`, { color: Colors.light.textSecondary }]}
                  >
                    +{receipt.tags.length - 2} more
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Right Section */}
          <View style={tw`items-end`}>
            <Text
              style={[
                tw`text-base font-bold mb-1`,
                { color: Colors.light.primary },
              ]}
            >
              {formatCurrency(receipt.amount, state.selectedCurrency)}
            </Text>
            {receipt.imageUri && (
              <AsyncImage
                imageKey={receipt.imageUri}
                style={tw`w-10 h-10 rounded-md`}
                resizeMode="cover"
                fallbackComponent={
                  <View
                    style={[
                      tw`w-10 h-10 rounded-md items-center justify-center`,
                      { backgroundColor: Colors.light.secondary },
                    ]}
                  >
                    <Ionicons
                      name="image"
                      size={16}
                      color={Colors.light.card}
                    />
                  </View>
                }
              />
            )}
          </View>
        </View>
      </AnimatedCard>
    </AnimatedSlideIn>
  );

  if (state.isLoading && !state.isInitialized) {
    return (
      <View
        style={[
          tw`flex-1 justify-center items-center`,
          { backgroundColor: Colors.light.background },
        ]}
      >
        <AnimatedFadeIn duration={800}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={[tw`mt-5 text-lg`, { color: Colors.light.text }]}>
            Loading your receipts...
          </Text>
        </AnimatedFadeIn>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: Colors.light.background }]}>
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`pb-24`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt Summary Card */}
        <AnimatedSlideIn direction="up" delay={300} duration={500}>
          <View style={tw`mx-4 mt-3`}>
            <AnimatedCard
              style={{
                backgroundColor: Colors.light.primary,
                borderRadius: 14,
                paddingVertical: 18,
                paddingHorizontal: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {/* Header */}
              <Text
                style={[
                  tw`text-lg font-semibold mb-2`,
                  { color: Colors.light.card },
                ]}
              >
                Receipts Summary
              </Text>

              {/* Stats */}
              {[
                {
                  icon: "document-text-outline",
                  label: "Total Receipts",
                  value: state.receipts.length,
                },
                {
                  icon: "pricetag-outline",
                  label: "Total Categories",
                  value: state.categories.length,
                },
                {
                  icon: "wallet-outline",
                  label: "Total Spending",
                  value: formatCurrency(
                    state.receipts.reduce((sum, r) => sum + r.amount, 0),
                    state.selectedCurrency
                  ),
                },
              ].map((item, index) => (
                <View
                  key={index}
                  style={[
                    tw`flex-row justify-between items-center py-2`,
                    index < 2 && {
                      borderBottomWidth: 0.5,
                      borderBottomColor: "rgba(255,255,255,0.08)",
                    },
                  ]}
                >
                  <View style={tw`flex-row items-center`}>
                    <Ionicons
                      name={item.icon}
                      size={16}
                      color={Colors.light.card}
                      style={{ opacity: 0.7 }}
                    />
                    <Text
                      style={[
                        tw`ml-2 text-sm`,
                        { color: Colors.light.card, opacity: 0.85 },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      tw`text-sm font-bold`,
                      { color: Colors.light.card },
                    ]}
                  >
                    {item.value}
                  </Text>
                </View>
              ))}
            </AnimatedCard>
          </View>
        </AnimatedSlideIn>

        {/* Quick Actions */}
        <AnimatedSlideIn direction="up" delay={400} duration={500}>
          <View style={tw`mt-5 px-5`}>
            {/* Title */}
            <Text
              style={[
                tw`text-lg font-semibold mb-3 text-start`,
                { color: Colors.light.text },
              ]}
            >
              Quick Actions
            </Text>

            {/* Buttons Row */}
            <View style={tw`flex-row justify-center`}>
              <View style={tw`flex-1 mr-2`}>
                {/* Add Receipt */}
                <AnimatedButton
                  onPress={() => router.push("/(tabs)/add-receipt")}
                  variant="primary"
                  style={{
                    backgroundColor: Colors.light.primary,
                    paddingVertical: 24,
                    borderRadius: 12,
                  }}
                >
                  <View style={tw`flex-row items-center justify-center`}>
                    <Ionicons
                      name="add-circle"
                      size={20}
                      color={Colors.light.card}
                    />
                    <Text
                      style={[
                        tw`ml-2 font-medium text-sm`,
                        { color: Colors.light.card },
                      ]}
                    >
                      Add Receipt
                    </Text>
                  </View>
                </AnimatedButton>
              </View>

              <View style={tw`flex-1 ml-2`}>
                {/* Categories */}
                <AnimatedButton
                  onPress={() => router.push("/(tabs)/categories")}
                  variant="outline"
                  style={{
                    backgroundColor: Colors.light.card,
                    borderColor: Colors.light.primary,
                    borderWidth: 1,
                    paddingVertical: 24,
                    borderRadius: 12,
                  }}
                >
                  <View style={tw`flex-row items-center justify-center`}>
                    <Ionicons
                      name="pricetag"
                      size={20}
                      color={Colors.light.primary}
                    />
                    <Text
                      style={[
                        tw`ml-2 font-medium text-sm`,
                        { color: Colors.light.primary },
                      ]}
                    >
                      Categories
                    </Text>
                  </View>
                </AnimatedButton>
              </View>
            </View>
          </View>
        </AnimatedSlideIn>

        {/* Recent Receipts */}
        <AnimatedSlideIn direction="up" delay={500} duration={500}>
          <View style={tw`px-5 mt-6`}>
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text
                style={[
                  tw`text-lg font-semibold`,
                  { color: Colors.light.text },
                ]}
              >
                Recent Receipts
              </Text>
              {state.receipts.length > 0 && (
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/receipts")}
                  style={tw`flex-row items-center`}
                >
                  <Text
                    style={[
                      tw`text-sm font-medium`,
                      { color: Colors.light.primary },
                    ]}
                  >
                    View All
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Colors.light.primary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Empty / Data */}
            {state.receipts.length === 0 ? (
              <AnimatedCard
                style={{
                  paddingVertical: 28,
                  paddingHorizontal: 20,
                  alignItems: "center",
                  backgroundColor: Colors.light.card,
                  borderRadius: 16,
                }}
              >
                <Ionicons
                  name="receipt-outline"
                  size={56}
                  color={Colors.light.secondary}
                />
                <Text
                  style={[
                    tw`text-center mt-3 text-lg font-semibold`,
                    { color: Colors.light.text },
                  ]}
                >
                  No receipts yet
                </Text>
                <Text
                  style={[
                    tw`text-center mt-1 text-sm`,
                    { color: Colors.light.textSecondary },
                  ]}
                >
                  Add your first receipt to get started
                </Text>
              </AnimatedCard>
            ) : recentReceipts.length === 0 ? (
              <AnimatedCard
                style={{
                  paddingVertical: 28,
                  paddingHorizontal: 20,
                  alignItems: "center",
                  backgroundColor: Colors.light.cardSecondary,
                  borderRadius: 16,
                }}
              >
                <Ionicons
                  name="receipt-outline"
                  size={56}
                  color={Colors.light.secondary}
                />
                <Text
                  style={[
                    tw`text-center mt-3 text-lg font-semibold`,
                    { color: Colors.light.text },
                  ]}
                >
                  No recent receipts
                </Text>
                <Text
                  style={[
                    tw`text-center mt-1 text-sm`,
                    { color: Colors.light.textSecondary },
                  ]}
                >
                  Add some receipts to see them here
                </Text>
              </AnimatedCard>
            ) : (
              recentReceipts.map((receipt, index) =>
                renderReceiptItem(receipt, index)
              )
            )}
          </View>
        </AnimatedSlideIn>
      </ScrollView>

      <Modal
        visible={!!selectedReceipt}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReceipt(null)}
      >
        <View style={tw`flex-1 bg-black/50 justify-end`}>
          <View
            style={{
              backgroundColor: Colors.light.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
          >
            {/* Header */}
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text
                style={[tw`text-lg font-bold`, { color: Colors.light.text }]}
              >
                Receipt Details
              </Text>
              <Pressable
                onPress={() => setSelectedReceipt(null)}
                style={tw`p-2 rounded-full bg-gray-100`}
              >
                <Ionicons name="close" size={18} color={Colors.light.text} />
              </Pressable>
            </View>

            {/* Image */}
            {selectedReceipt?.imageUri && (
              <AsyncImage
                imageKey={selectedReceipt.imageUri}
                style={tw`w-full h-48 rounded-lg mb-4`}
                resizeMode="cover"
              />
            )}

            {/* Info list */}
            <View style={tw`space-y-3`}>
              <InfoRow label="Vendor" value={selectedReceipt?.vendor} />
              <InfoRow
                label="Amount"
                value={formatCurrency(
                  selectedReceipt?.amount || 0,
                  state.selectedCurrency
                )}
                valueStyle={{ color: Colors.light.primary, fontWeight: "bold" }}
              />
              <InfoRow
                label="Date"
                value={selectedReceipt && formatDate(selectedReceipt.date)}
              />
              {selectedReceipt?.notes && (
                <InfoRow label="Notes" value={selectedReceipt.notes} />
              )}
            </View>

            {/* Cancel Button */}
            <Pressable
              onPress={() => setSelectedReceipt(null)}
              style={[
                tw`mt-6 py-3 rounded-lg items-center`,
                { backgroundColor: Colors.light.primary },
              ]}
            >
              <Text
                style={[
                  tw`text-base font-medium`,
                  { color: Colors.light.card },
                ]}
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
