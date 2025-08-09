import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
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
import { formatCurrency, formatDate } from "../utils/helpers";

export default function ReceiptDetailsScreen() {
  const { state, saveReceipt, deleteReceipt } = useApp();
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Receipt>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const handleReceiptPress = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setEditForm({
      id: receipt.id,
      vendor: receipt.vendor,
      amount: receipt.amount,
      date: receipt.date,
      notes: receipt.notes || "",
      tags: receipt.tags || [],
      imageUri: receipt.imageUri,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    });
    setIsEditModalVisible(true);
  };

  const handleEdit = async () => {
    if (!selectedReceipt || !editForm.vendor || !editForm.amount) {
      Alert.alert(
        "Error",
        "Please fill in all required fields (Vendor and Amount)"
      );
      return;
    }

    setIsLoading(true);
    try {
      const updatedReceipt: Receipt = {
        ...selectedReceipt,
        ...editForm,
        vendor: editForm.vendor!,
        amount: editForm.amount!,
        date: editForm.date || selectedReceipt.date,
        notes: editForm.notes || "",
        tags: editForm.tags || [],
        updatedAt: new Date().toISOString(),
      };

      await saveReceipt(updatedReceipt);
      setIsEditModalVisible(false);
      setSelectedReceipt(null);
      setEditForm({});
      Alert.alert("Success", "Receipt updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update receipt. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (receipt: Receipt) => {
    Alert.alert(
      "Delete Receipt",
      `Are you sure you want to delete the receipt from ${receipt.vendor}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReceipt(receipt.id);
              Alert.alert("Success", "Receipt deleted successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to delete receipt.");
            }
          },
        },
      ]
    );
  };

  const handleExport = async (receipt: Receipt) => {
    try {
      const receiptData = {
        vendor: receipt.vendor,
        amount: receipt.amount,
        date: receipt.date,
        notes: receipt.notes,
        tags: receipt.tags,
        createdAt: receipt.createdAt,
      };

      const dataString = JSON.stringify(receiptData, null, 2);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync("receipt-data.json", {
          mimeType: "application/json",
          dialogTitle: "Export Receipt Data",
        });
      } else {
        Alert.alert("Export", "Sharing not available on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export receipt data.");
    }
  };

  const renderReceiptItem = ({
    item,
    index,
  }: {
    item: Receipt;
    index: number;
  }) => (
    <AnimatedSlideIn
      key={item.id}
      direction="left"
      delay={index * 100}
      duration={400}
    >
      <TouchableOpacity
        onPress={() => handleReceiptPress(item)}
        activeOpacity={0.7}
        style={{
          backgroundColor: Colors.light.card,
          borderRadius: 12,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View style={tw`flex-row items-center`}>
          {/* Image or Icon */}
          <View style={tw`mr-4`}>
            {item.imageUri ? (
              <AsyncImage
                imageKey={item.imageUri}
                style={tw`w-12 h-12 rounded-lg`}
                resizeMode="cover"
                fallbackComponent={
                  <View
                    style={[
                      tw`w-12 h-12 rounded-lg items-center justify-center`,
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
            ) : (
              <View
                style={[
                  tw`w-12 h-12 rounded-lg items-center justify-center`,
                  { backgroundColor: Colors.light.secondary },
                ]}
              >
                <Ionicons name="receipt" size={20} color={Colors.light.card} />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center justify-between mb-1`}>
              <Text
                style={[
                  tw`text-base font-semibold`,
                  { color: Colors.light.text },
                ]}
                numberOfLines={1}
              >
                {item.vendor}
              </Text>
              <Text
                style={[tw`text-lg font-bold`, { color: Colors.light.primary }]}
              >
                {formatCurrency(item.amount, state.selectedCurrency)}
              </Text>
            </View>

            <View style={tw`flex-row items-center justify-between`}>
              <Text
                style={[tw`text-sm`, { color: Colors.light.textSecondary }]}
              >
                {formatDate(item.date)}
              </Text>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <View style={tw`flex-row items-center`}>
                  <Ionicons
                    name="pricetag"
                    size={12}
                    color={Colors.light.textSecondary}
                  />
                  <Text
                    style={[
                      tw`ml-1 text-xs`,
                      { color: Colors.light.textSecondary },
                    ]}
                  >
                    {item.tags.length} {item.tags.length === 1 ? "tag" : "tags"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={tw`flex-row items-center ml-3`}>
            <TouchableOpacity
              onPress={() => handleReceiptPress(item)}
              style={[
                tw`p-2 rounded-full mr-2`,
                { backgroundColor: Colors.light.primary },
              ]}
            >
              <Ionicons name="create" size={16} color={Colors.light.card} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={[
                tw`p-2 rounded-full`,
                { backgroundColor: Colors.light.error },
              ]}
            >
              <Ionicons name="trash" size={16} color={Colors.light.card} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </AnimatedSlideIn>
  );

  const renderCategoryModal = () => {
    const currentTags = editForm.tags || [];
    const availableCategories = state.categories.filter(
      (cat) => !currentTags.includes(cat.name)
    );

    return (
      <Modal
        visible={isCategoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={[tw`flex-1`, { backgroundColor: Colors.light.overlay }]}>
          <View style={tw`flex-1 justify-center items-center px-4`}>
            <AnimatedCard
              style={{
                width: "100%",
                maxWidth: 400,
                backgroundColor: Colors.light.card,
                borderRadius: 16,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <View style={tw`flex-row items-center`}>
                  <View
                    style={[
                      tw`w-8 h-8 rounded-full items-center justify-center mr-2`,
                      { backgroundColor: Colors.light.primary },
                    ]}
                  >
                    <Ionicons
                      name="pricetag"
                      size={15}
                      color={Colors.light.card}
                    />
                  </View>
                  <Text
                    style={[
                      tw`text-lg font-semibold`,
                      { color: Colors.light.text },
                    ]}
                  >
                    Select Category
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsCategoryModalVisible(false)}
                  style={[
                    tw`p-1.5 rounded-full`,
                    { backgroundColor: Colors.light.border },
                  ]}
                >
                  <Ionicons name="close" size={20} color={Colors.light.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={tw`max-h-80`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`pb-4`}
              >
                <View style={tw`space-y-2`}>
                  {availableCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => {
                        setEditForm((prev) => ({
                          ...prev,
                          tags: [...(prev.tags || []), category.name],
                        }));
                        setIsCategoryModalVisible(false);
                      }}
                      style={[
                        tw`flex-row items-center p-4 rounded-lg border`,
                        {
                          backgroundColor: Colors.light.card,
                          borderColor: Colors.light.border,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
                          { backgroundColor: Colors.light.primary },
                        ]}
                      >
                        <Ionicons
                          name="pricetag"
                          size={18}
                          color={Colors.light.card}
                        />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text
                          style={[
                            tw`text-base font-semibold`,
                            { color: Colors.light.text },
                          ]}
                        >
                          {category.name}
                        </Text>
                        <Text
                          style={[
                            tw`text-sm mt-1`,
                            { color: Colors.light.textSecondary },
                          ]}
                        >
                          Tap to add this category
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={Colors.light.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {availableCategories.length === 0 && (
                <View style={tw`py-8 items-center`}>
                  <Ionicons
                    name="checkmark-circle"
                    size={48}
                    color={Colors.light.secondary}
                  />
                  <Text
                    style={[
                      tw`text-center mt-3 text-base font-semibold`,
                      { color: Colors.light.text },
                    ]}
                  >
                    All Categories Selected
                  </Text>
                  <Text
                    style={[
                      tw`text-center mt-1 text-sm`,
                      { color: Colors.light.textSecondary },
                    ]}
                  >
                    You&apos;ve already added all available categories
                  </Text>
                </View>
              )}
            </AnimatedCard>
          </View>
        </View>
      </Modal>
    );
  };

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <View style={[tw`flex-1`, { backgroundColor: Colors.light.overlay }]}>
        <View style={tw`flex-1 justify-center items-center px-4`}>
          <AnimatedCard
            style={{
              width: "100%",
              maxWidth: 450,
              maxHeight: "90%",
              backgroundColor: Colors.light.card,
              minHeight: 500,
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <View style={tw`flex-row items-center`}>
                <View
                  style={[
                    tw`w-8 h-8 rounded-full items-center justify-center mr-2`,
                    { backgroundColor: Colors.light.primary },
                  ]}
                >
                  <Ionicons name="create" size={15} color={Colors.light.card} />
                </View>
                <Text
                  style={[
                    tw`text-lg font-semibold`,
                    { color: Colors.light.text },
                  ]}
                >
                  Edit Receipt
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsEditModalVisible(false);
                  setSelectedReceipt(null);
                  setEditForm({});
                }}
                style={[
                  tw`p-1.5 rounded-full`,
                  { backgroundColor: Colors.light.border },
                ]}
              >
                <Ionicons name="close" size={20} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={[tw`flex-1`, { minHeight: 300 }]}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={tw`pb-4`}
            >
              <View style={tw`space-y-4`}>
                {/* Image Display */}
                {editForm.imageUri && (
                  <View>
                    <Text
                      style={[
                        tw`text-sm font-semibold mb-2`,
                        { color: Colors.light.text },
                      ]}
                    >
                      Receipt Image
                    </Text>
                    <View style={tw`relative`}>
                      <AsyncImage
                        imageKey={editForm.imageUri}
                        style={tw`w-full h-40 rounded-xl`}
                        resizeMode="cover"
                        fallbackComponent={
                          <View
                            style={[
                              tw`w-full h-40 rounded-xl items-center justify-center`,
                              { backgroundColor: Colors.light.secondary },
                            ]}
                          >
                            <Ionicons
                              name="image"
                              size={32}
                              color={Colors.light.card}
                            />
                            <Text
                              style={[
                                tw`mt-2 text-sm`,
                                { color: Colors.light.card },
                              ]}
                            >
                              Image not available
                            </Text>
                          </View>
                        }
                      />
                      <View
                        style={[
                          tw`absolute top-2 right-2 px-3 py-1 rounded-full`,
                          { backgroundColor: "rgba(0,0,0,0.6)" },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-xs font-medium`,
                            { color: Colors.light.card },
                          ]}
                        >
                          Receipt
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <View>
                  <Text
                    style={[
                      tw`text-sm font-semibold mb-1 mt-2`,
                      { color: Colors.light.text },
                    ]}
                  >
                    Vendor
                  </Text>
                  <TextInput
                    style={[
                      tw`rounded-lg px-3 py-3 border`,
                      {
                        backgroundColor: Colors.light.card,
                        borderColor: Colors.light.border,
                        color: Colors.light.text,
                        fontSize: 15,
                      },
                    ]}
                    value={editForm.vendor || ""}
                    onChangeText={(text) =>
                      setEditForm((prev) => ({ ...prev, vendor: text }))
                    }
                    placeholder="Enter vendor name"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>

                <View>
                  <Text
                    style={[
                      tw`text-sm font-semibold mb-1 mt-2`,
                      { color: Colors.light.text },
                    ]}
                  >
                    Amount
                  </Text>
                  <TextInput
                    style={[
                      tw`rounded-xl px-4 py-4 border-2`,
                      {
                        backgroundColor: Colors.light.card,
                        borderColor: Colors.light.border,
                        color: Colors.light.text,
                        fontSize: 15,
                      },
                    ]}
                    value={editForm.amount?.toString() || ""}
                    onChangeText={(text) =>
                      setEditForm((prev) => ({
                        ...prev,
                        amount: parseFloat(text) || 0,
                      }))
                    }
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>

                <View>
                  <Text
                    style={[
                      tw`text-sm font-semibold mb-1 mt-2`,
                      { color: Colors.light.text },
                    ]}
                  >
                    Date
                  </Text>
                  <TextInput
                    style={[
                      tw`rounded-xl px-4 py-4 border-2`,
                      {
                        backgroundColor: Colors.light.card,
                        borderColor: Colors.light.border,
                        color: Colors.light.text,
                        fontSize: 16,
                      },
                    ]}
                    value={editForm.date || ""}
                    onChangeText={(text) =>
                      setEditForm((prev) => ({ ...prev, date: text }))
                    }
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>

                <View>
                  <Text
                    style={[
                      tw`text-sm font-semibold mb-1 mt-2`,
                      { color: Colors.light.text },
                    ]}
                  >
                    Notes
                  </Text>
                  <TextInput
                    style={[
                      tw`rounded-xl px-4 py-4 border-2`,
                      {
                        backgroundColor: Colors.light.card,
                        borderColor: Colors.light.border,
                        color: Colors.light.text,
                        fontSize: 16,
                        minHeight: 80,
                      },
                    ]}
                    value={editForm.notes || ""}
                    onChangeText={(text) =>
                      setEditForm((prev) => ({ ...prev, notes: text }))
                    }
                    placeholder="Add notes (optional)"
                    placeholderTextColor={Colors.light.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View>
                  <Text
                    style={[
                      tw`text-sm font-semibold mb-1 mt-2`,
                      { color: Colors.light.text },
                    ]}
                  >
                    Categories
                  </Text>

                  {/* Selected Categories Display */}
                  {(editForm.tags || []).length > 0 && (
                    <View style={tw`mb-3`}>
                      <Text
                        style={[
                          tw`text-xs mb-2`,
                          { color: Colors.light.textSecondary },
                        ]}
                      >
                        Selected Categories:
                      </Text>
                      <View style={tw`flex-row flex-wrap gap-2`}>
                        {(editForm.tags || []).map((tag, index) => (
                          <View
                            key={index}
                            style={[
                              tw`flex-row items-center px-3 py-1 rounded-full`,
                              { backgroundColor: Colors.light.primary },
                            ]}
                          >
                            <Text
                              style={[
                                tw`text-xs mr-1`,
                                { color: Colors.light.card },
                              ]}
                            >
                              {tag}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                setEditForm((prev) => ({
                                  ...prev,
                                  tags: (prev.tags || []).filter(
                                    (t) => t !== tag
                                  ),
                                }));
                              }}
                            >
                              <Ionicons
                                name="close-circle"
                                size={14}
                                color={Colors.light.card}
                              />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Category Selector */}
                  <TouchableOpacity
                    onPress={() => {
                      const currentTags = editForm.tags || [];
                      const availableCategories = state.categories.filter(
                        (cat) => !currentTags.includes(cat.name)
                      );

                      if (availableCategories.length > 0) {
                        setIsCategoryModalVisible(true);
                      } else {
                        Alert.alert(
                          "No Categories",
                          "All categories are already selected."
                        );
                      }
                    }}
                    style={[
                      tw`flex-row items-center justify-between p-4 rounded-lg border-2 border-dashed`,
                      {
                        backgroundColor: Colors.light.card,
                        borderColor: Colors.light.border,
                      },
                    ]}
                  >
                    <View style={tw`flex-row items-center`}>
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color={Colors.light.primary}
                        style={tw`mr-2`}
                      />
                      <Text
                        style={[tw`text-base`, { color: Colors.light.text }]}
                      >
                        Add Category
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={Colors.light.textSecondary}
                    />
                  </TouchableOpacity>

                  <Text
                    style={[
                      tw`text-xs mt-2`,
                      { color: Colors.light.textSecondary },
                    ]}
                  >
                    Tap to add categories to this receipt
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={tw`mt-3`}>
              <AnimatedButton
                onPress={handleEdit}
                disabled={isLoading}
                variant="primary"
                style={{
                  width: "100%",
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.light.card} />
                ) : (
                  <View style={tw`flex-row items-center justify-center`}>
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={Colors.light.card}
                    />
                    <Text
                      style={[
                        tw`ml-2 text-base font-semibold`,
                        { color: Colors.light.card },
                      ]}
                    >
                      Save Changes
                    </Text>
                  </View>
                )}
              </AnimatedButton>
            </View>
          </AnimatedCard>
        </View>
      </View>
    </Modal>
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
          <Text style={[tw`mt-4 text-lg`, { color: Colors.light.text }]}>
            Loading receipts...
          </Text>
        </AnimatedFadeIn>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: Colors.light.background }]}>
      {state.receipts.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center px-6`}>
          <AnimatedFadeIn duration={800}>
            {/* Icon */}
            <Ionicons
              name="receipt-outline"
              size={72}
              color={Colors.light.secondary}
              style={tw`self-center`}
            />

            {/* Title */}
            <Text
              style={[
                tw`text-center mt-5 text-lg font-semibold`,
                { color: Colors.light.text },
              ]}
            >
              No receipts yet
            </Text>

            {/* Subtitle */}
            <Text
              style={[
                tw`text-center mt-2 mb-6`,
                { color: Colors.light.textSecondary },
              ]}
            >
              Add some receipts to see them here
            </Text>

            {/* Add Receipt Button */}
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/add-receipt")}
              style={[
                tw`flex-row items-center justify-center py-3 px-6 rounded-lg`,
                { backgroundColor: Colors.light.primary },
              ]}
            >
              <Ionicons name="add" size={20} color={Colors.light.card} />
              <Text
                style={[
                  tw`ml-2 text-base font-medium`,
                  { color: Colors.light.card },
                ]}
              >
                Add Receipt
              </Text>
            </TouchableOpacity>
          </AnimatedFadeIn>
        </View>
      ) : (
        <>
          <FlatList
            data={state.receipts}
            renderItem={renderReceiptItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={tw`px-4 py-2`}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={tw`h-2`} />}
          />
        </>
      )}

      {renderEditModal()}
      {renderCategoryModal()}
    </View>
  );
}
