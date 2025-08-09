import { Ionicons } from "@expo/vector-icons";
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
import { Colors, Shadows } from "../constants/Colors";
import { useApp } from "../context/AppContext";
import { Category } from "../storage/receiptStorage";
import {
  formatCurrency,
  getReceiptsByTag,
  getSpendingByCategory,
  getTotalSpending,
} from "../utils/helpers";

const categoryColors = [
  Colors.light.primary,
  Colors.light.secondary,
  Colors.light.success,
  "#5a9a7a",
  "#3e7a57",
  "#225a34",
  "#d1d9a3",
  "#bac77e",
  "#a3b559",
  "#8b5cf6",
];

export default function CategoriesScreen() {
  const { state, saveCategory, deleteCategory } = useApp();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: categoryColors[0],
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const spendingByCategory = getSpendingByCategory(
    state.receipts,
    state.categories
  );

  const totalSpending = getTotalSpending(state.receipts);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const category: Category = {
        id: Date.now().toString(),
        name: newCategory.name.trim(),
        color: newCategory.color,
        createdAt: new Date().toISOString(),
      };

      await saveCategory(category);
      setNewCategory({ name: "", color: categoryColors[0] });
      setIsAddModalVisible(false);
      Alert.alert("Success", "Category added successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"? This will remove the category from all receipts.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert("Success", "Category deleted successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to delete category");
            }
          },
        },
      ]
    );
  };

  const renderCategoryItem = ({
    item,
    index,
  }: {
    item: Category;
    index: number;
  }) => {
    const receiptsInCategory = getReceiptsByTag(state.receipts, item.name);
    const totalSpending = spendingByCategory[item.name] || 0;

    return (
      <AnimatedSlideIn
        key={item.id}
        direction="left"
        delay={index * 100}
        duration={400}
      >
        <AnimatedCard
          style={{
            backgroundColor: Colors.light.card,
            borderColor: Colors.light.borderPrimary,
          }}
        >
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={[
                  tw`w-4 h-4 rounded-full mr-3`,
                  { backgroundColor: item.color },
                ]}
              />
              <View style={tw`flex-1`}>
                <Text
                  style={[
                    tw`text-lg font-semibold`,
                    { color: Colors.light.text },
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    tw`text-sm mt-1`,
                    { color: Colors.light.textSecondary },
                  ]}
                >
                  {receiptsInCategory.length} receipt
                  {receiptsInCategory.length !== 1 ? "s" : ""} •{" "}
                  {formatCurrency(totalSpending, state.selectedCurrency)}
                </Text>
              </View>
            </View>
            <View style={tw`flex-row`}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(item.id);
                  setNewCategory({ name: item.name, color: item.color });
                  setIsAddModalVisible(true);
                }}
                style={[
                  tw`p-2 rounded-full`,
                  { backgroundColor: Colors.light.secondary },
                ]}
              >
                <Ionicons name="create" size={16} color={Colors.light.card} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteCategory(item)}
                style={[
                  tw`p-2 rounded-full ml-2`,
                  { backgroundColor: Colors.light.error },
                ]}
              >
                <Ionicons name="trash" size={16} color={Colors.light.card} />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedCard>
      </AnimatedSlideIn>
    );
  };

  const renderAddModal = () => (
    <Modal
      visible={isAddModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsAddModalVisible(false)}
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
            }}
          >
            {/* Header */}
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text
                style={[tw`text-xl font-bold`, { color: Colors.light.text }]}
              >
                {selectedCategory ? "Edit Category" : "Add Category"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsAddModalVisible(false);
                  setSelectedCategory(null);
                  setNewCategory({ name: "", color: categoryColors[0] });
                }}
                style={[
                  tw`p-2 rounded-full`,
                  { backgroundColor: Colors.light.border },
                ]}
              >
                <Ionicons name="close" size={20} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            {/* Category Name */}
            <View style={tw`mb-5`}>
              <Text
                style={[
                  tw`text-sm font-semibold mb-2`,
                  { color: Colors.light.text },
                ]}
              >
                Category Name
              </Text>
              <TextInput
                style={[
                  tw`rounded-lg px-4 py-3 border`,
                  {
                    backgroundColor: Colors.light.card,
                    borderColor: Colors.light.border,
                    color: Colors.light.text,
                  },
                ]}
                value={newCategory.name}
                onChangeText={(text) =>
                  setNewCategory((prev) => ({ ...prev, name: text }))
                }
                placeholder="Enter category name"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            {/* Color Picker */}
            <View>
              <Text
                style={[
                  tw`text-sm font-semibold mb-3`,
                  { color: Colors.light.text },
                ]}
              >
                Color
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={tw`flex-row`}>
                  {categoryColors.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        tw`w-9 h-9 rounded-full border-2`,
                        index > 0 && { marginLeft: 10 },
                        newCategory.color === color
                          ? { borderColor: Colors.light.primary }
                          : { borderColor: Colors.light.border },
                        { backgroundColor: color },
                      ]}
                      onPress={() =>
                        setNewCategory((prev) => ({ ...prev, color }))
                      }
                    />
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Primary Button Only */}
            <AnimatedButton
              onPress={handleAddCategory}
              disabled={isSubmitting}
              variant="primary"
              style={{ marginTop: 24, borderRadius: 10 }}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.light.card} />
              ) : (
                <Text
                  style={[
                    tw`text-center font-semibold`,
                    { color: Colors.light.card },
                  ]}
                >
                  {selectedCategory ? "Update" : "Add"}
                </Text>
              )}
            </AnimatedButton>
          </AnimatedCard>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[tw`flex-1`, { backgroundColor: Colors.light.background }]}>
      {state.categories.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center px-6`}>
          <AnimatedFadeIn duration={800}>
            {/* Icon */}
            <Ionicons
              name="pricetag-outline"
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
              No categories yet
            </Text>

            {/* Subtitle */}
            <Text
              style={[
                tw`text-center mt-2 mb-6`,
                { color: Colors.light.textSecondary },
              ]}
            >
              Create your first category to get started
            </Text>

            {/* Add Button */}
            <TouchableOpacity
              onPress={() => setIsAddModalVisible(true)}
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
                Add Category
              </Text>
            </TouchableOpacity>
          </AnimatedFadeIn>
        </View>
      ) : (
        <FlatList
          data={state.categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`px-6 pb-20`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <>
              {/* Total Spending Statistics */}
              <AnimatedSlideIn direction="up" delay={300} duration={500}>
                <View style={tw`mb-6 mt-4`}>
                  <AnimatedCard
                    style={{
                      backgroundColor: Colors.light.primary,
                      borderColor: Colors.light.primary,
                    }}
                  >
                    <View
                      style={tw`flex-row justify-between items-center mb-4`}
                    >
                      <Text
                        style={[
                          tw`text-lg font-semibold`,
                          { color: Colors.light.card },
                        ]}
                      >
                        Total Spending
                      </Text>
                      <View
                        style={[
                          tw`rounded-full p-2`,
                          { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                        ]}
                      >
                        <Ionicons
                          name="trending-up"
                          size={24}
                          color={Colors.light.card}
                        />
                      </View>
                    </View>
                    <Text
                      style={[
                        tw`text-3xl font-bold mb-2`,
                        { color: Colors.light.card },
                      ]}
                    >
                      {formatCurrency(totalSpending, state.selectedCurrency)}
                    </Text>
                    <Text style={[tw`text-sm`, { color: Colors.light.card }]}>
                      Across all categories
                    </Text>
                  </AnimatedCard>
                </View>
              </AnimatedSlideIn>

              <View style={tw`mb-4`}>
                <Text
                  style={[
                    tw`text-lg font-semibold`,
                    { color: Colors.light.text },
                  ]}
                >
                  Your Categories
                </Text>
              </View>
            </>
          )}
        />
      )}

      {/* Floating Action Button */}
      {state.categories.length > 0 && (
        <AnimatedSlideIn direction="up" delay={500} duration={500}>
          <View style={[tw`absolute bottom-30 right-6`, { zIndex: 9999 }]}>
            <TouchableOpacity
              style={[
                tw`w-14 h-14 rounded-full items-center justify-center`,
                {
                  backgroundColor: Colors.light.primary,
                  ...Shadows.lg,
                  zIndex: 9999,
                },
              ]}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Ionicons name="add" size={24} color={Colors.light.card} />
            </TouchableOpacity>
          </View>
        </AnimatedSlideIn>
      )}

      {renderAddModal()}
    </View>
  );
}
