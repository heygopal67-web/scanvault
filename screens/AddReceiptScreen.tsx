import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  AnimatedSlideIn,
} from "../components/AnimatedComponents";
import { Colors } from "../constants/Colors";
import { useApp } from "../context/AppContext";
import { Receipt } from "../storage/receiptStorage";
import { generateId, validateReceipt } from "../utils/helpers";

export default function AddReceiptScreen() {
  const { saveReceipt, state, loadCategories } = useApp();
  const [formData, setFormData] = useState({
    vendor: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    selectedCategories: [] as string[],
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  // Function to convert image to base64 and store in AsyncStorage
  const storeImageInAsyncStorage = async (uri: string): Promise<string> => {
    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create a unique key for the image
      const imageKey = `receipt_image_${Date.now()}`;

      // Store the base64 data in AsyncStorage
      await AsyncStorage.setItem(imageKey, base64);

      // Return the key as the "URI" - we'll use this to retrieve the image
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("Error storing image:", error);
      return uri; // Fallback to original URI if storing fails
    }
  };

  // Load categories when component mounts
  const getImageFromStorage = async (key: string): Promise<string | null> => {
    const base64 = await AsyncStorage.getItem(key);
    return base64 ? `data:image/jpeg;base64,${base64}` : null;
  };
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera permission is required to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const displayUri = await storeImageInAsyncStorage(result.assets[0].uri);
      setImageUri(displayUri); // now shows instantly
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Gallery permission is required to select images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const displayUri = await storeImageInAsyncStorage(result.assets[0].uri);
      setImageUri(displayUri);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter((id) => id !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }));
  };

  const getSelectedCategoryNames = (): string[] => {
    return state.categories
      .filter((category) => formData.selectedCategories.includes(category.id))
      .map((category) => category.name);
  };

  const handleSubmit = async () => {
    const receiptData: Partial<Receipt> = {
      vendor: formData.vendor,
      amount: parseFloat(formData.amount),
      date: formData.date,
      notes: formData.notes,
      tags: [...getSelectedCategoryNames()],
      imageUri: imageUri || undefined,
    };

    const validation = validateReceipt(receiptData);
    if (!validation.isValid) {
      Alert.alert("Validation Error", validation.errors.join("\n"));
      return;
    }

    setIsSubmitting(true);
    try {
      const receipt: Receipt = {
        id: generateId(),
        vendor: formData.vendor,
        amount: parseFloat(formData.amount),
        date: formData.date,
        notes: formData.notes,
        tags: [...getSelectedCategoryNames()],
        imageUri: imageUri || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Saving receipt with imageUri:", receipt.imageUri);
      await saveReceipt(receipt);

      // Reset form
      setFormData({
        vendor: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        selectedCategories: [],
      });
      setImageUri(null);

      Alert.alert("Success", "Receipt saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save receipt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.vendor.trim() &&
    formData.amount &&
    parseFloat(formData.amount) > 0;

  return (
    <KeyboardAvoidingView
      style={[tw`flex-1`, { backgroundColor: Colors.light.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={tw`flex-1 px-6 py-4`}
        contentContainerStyle={tw`pb-24`}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        <AnimatedSlideIn direction="up" delay={300} duration={500}>
          <View style={tw`mb-6`}>
            <Text
              style={[
                tw`text-lg font-semibold mb-2`,
                { color: Colors.light.text },
              ]}
            >
              Add Receipt Image
            </Text>

            {imageUri ? (
              <AnimatedCard style={{ padding: 0, overflow: "hidden" }}>
                <View style={tw`relative`}>
                  <Image
                    source={{ uri: imageUri }}
                    style={tw`w-full h-44 rounded-lg`}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={[
                      tw`absolute top-2 right-2 rounded-full p-1.5`,
                      { backgroundColor: Colors.light.error },
                    ]}
                    onPress={() => setImageUri(null)}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={Colors.light.card}
                    />
                  </TouchableOpacity>
                </View>
              </AnimatedCard>
            ) : (
              <AnimatedCard
                style={{
                  borderColor: Colors.light.border,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                }}
              >
                {/* Buttons */}
                <View style={tw`flex-row justify-center`}>
                  {/* Camera */}
                  <TouchableOpacity
                    onPress={takePhoto}
                    style={[
                      tw`flex-row items-center rounded-lg`,
                      {
                        backgroundColor: Colors.light.primary,
                        paddingVertical: 28,
                        paddingHorizontal: 28,
                      },
                    ]}
                  >
                    <Ionicons
                      name="camera"
                      size={24}
                      color={Colors.light.card}
                    />
                    <Text
                      style={[
                        tw`ml-1 text-base font-medium`,
                        { color: Colors.light.card },
                      ]}
                    >
                      Camera
                    </Text>
                  </TouchableOpacity>

                  {/* Gallery */}
                  <TouchableOpacity
                    onPress={pickImage}
                    style={[
                      tw`flex-row items-center ml-6 rounded-lg border`,
                      {
                        backgroundColor: Colors.light.card,
                        borderColor: Colors.light.primary,
                        paddingVertical: 28,
                        paddingHorizontal: 28,
                      },
                    ]}
                  >
                    <Ionicons
                      name="images"
                      size={24}
                      color={Colors.light.primary}
                    />
                    <Text
                      style={[
                        tw`ml-2 text-base font-medium`,
                        { color: Colors.light.primary },
                      ]}
                    >
                      Gallery
                    </Text>
                  </TouchableOpacity>
                </View>
              </AnimatedCard>
            )}
          </View>
        </AnimatedSlideIn>

        {/* Form Section */}
        <AnimatedSlideIn direction="up" delay={400} duration={500}>
          <View style={tw`mb-6`}>
            <Text
              style={[
                tw`text-lg font-semibold mb-4`,
                { color: Colors.light.text },
              ]}
            >
              Receipt Details
            </Text>

            {/* Vendor */}
            <View style={tw`mb-4`}>
              <Text
                style={[
                  tw`text-sm font-medium mb-2`,
                  { color: Colors.light.text },
                ]}
              >
                Vendor *
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
                value={formData.vendor}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, vendor: text }))
                }
                placeholder="Enter vendor name"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            {/* Amount */}
            <View style={tw`mb-4`}>
              <Text
                style={[
                  tw`text-sm font-medium mb-2`,
                  { color: Colors.light.text },
                ]}
              >
                Amount *
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
                value={formData.amount}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, amount: text }))
                }
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            {/* Date */}
            <View style={tw`mb-4`}>
              <Text
                style={[
                  tw`text-sm font-medium mb-2`,
                  { color: Colors.light.text },
                ]}
              >
                Date
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
                value={formData.date}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, date: text }))
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            {/* Notes */}
            <View style={tw`mb-4`}>
              <Text
                style={[
                  tw`text-sm font-medium mb-2`,
                  { color: Colors.light.text },
                ]}
              >
                Notes
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
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, notes: text }))
                }
                placeholder="Add notes (optional)"
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Categories */}
            <View style={tw`mb-6`}>
              <Text
                style={[
                  tw`text-sm font-medium mb-2`,
                  { color: Colors.light.text },
                ]}
              >
                Categories
              </Text>
              <TouchableOpacity
                style={[
                  tw`rounded-lg px-4 py-3 border`,
                  {
                    backgroundColor: Colors.light.card,
                    borderColor: Colors.light.border,
                  },
                ]}
                onPress={() => setIsCategoryModalVisible(true)}
              >
                <View style={tw`flex-row justify-between items-center`}>
                  <Text
                    style={[tw`flex-1`, { color: Colors.light.textSecondary }]}
                  >
                    {formData.selectedCategories.length > 0
                      ? `${formData.selectedCategories.length} selected`
                      : "Select categories"}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.light.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedSlideIn>

        {/* Submit Button */}
        <AnimatedSlideIn direction="up" delay={500} duration={500}>
          <AnimatedButton
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            variant="primary"
            style={{ marginBottom: 20 }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.light.card} />
            ) : (
              <Text
                style={[
                  tw`text-center font-semibold text-lg`,
                  { color: Colors.light.card },
                ]}
              >
                Save Receipt
              </Text>
            )}
          </AnimatedButton>
        </AnimatedSlideIn>
      </ScrollView>

      {/* Category Selection Modal */}
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
                maxHeight: "80%",
                backgroundColor: Colors.light.card,
                minHeight: 320,
                paddingBottom: 12,
              }}
            >
              {/* Header */}
              <View style={tw`flex-row justify-between items-center mb-5`}>
                <Text
                  style={[tw`text-xl font-bold`, { color: Colors.light.text }]}
                >
                  Select Categories
                </Text>
                <TouchableOpacity
                  onPress={() => setIsCategoryModalVisible(false)}
                  style={[
                    tw`p-2 rounded-full`,
                    { backgroundColor: Colors.light.border },
                  ]}
                >
                  <Ionicons name="close" size={24} color={Colors.light.text} />
                </TouchableOpacity>
              </View>

              {/* Scrollable list */}
              <ScrollView
                style={[tw`flex-1`, { minHeight: 200 }]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`pb-4`}
              >
                {state.categories.length === 0 ? (
                  // Empty State
                  <View style={tw`items-center justify-center py-10 px-4`}>
                    <Ionicons
                      name="pricetag-outline"
                      size={56}
                      color={Colors.light.secondary}
                    />
                    <Text
                      style={[
                        tw`text-center mt-4 text-lg font-semibold`,
                        { color: Colors.light.text },
                      ]}
                    >
                      No categories yet
                    </Text>
                    <Text
                      style={[
                        tw`text-center mt-2 text-sm`,
                        { color: Colors.light.textSecondary },
                      ]}
                    >
                      Create categories in the{" "}
                      <Text
                        style={{
                          fontWeight: "600",
                          color: Colors.light.primary,
                        }}
                      >
                        Categories
                      </Text>{" "}
                      tab to select them here.
                    </Text>
                  </View>
                ) : (
                  state.categories.map((category) => {
                    const isSelected = formData.selectedCategories.includes(
                      category.id
                    );
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          tw`flex-row items-center p-3 rounded-lg mb-3`,
                          {
                            backgroundColor: isSelected
                              ? Colors.light.secondary
                              : Colors.light.card,
                            borderColor: Colors.light.border,
                            borderWidth: 1,
                            shadowColor: "#000",
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                          },
                        ]}
                        onPress={() => toggleCategory(category.id)}
                      >
                        {/* Color dot */}
                        <View
                          style={[
                            tw`w-5 h-5 rounded-full mr-3`,
                            { backgroundColor: category.color },
                          ]}
                        />
                        {/* Category name */}
                        <Text
                          style={[
                            tw`flex-1 font-medium`,
                            {
                              color: isSelected
                                ? Colors.light.card
                                : Colors.light.text,
                            },
                          ]}
                        >
                          {category.name}
                        </Text>
                        {/* Checkmark */}
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color={Colors.light.card}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              {/* Done Button */}
              {state.categories.length > 0 && (
                <AnimatedButton
                  onPress={() => setIsCategoryModalVisible(false)}
                  variant="primary"
                  style={{ marginTop: -30 }}
                >
                  <Text
                    style={[
                      tw`text-center font-semibold`,
                      { color: Colors.light.card },
                    ]}
                  >
                    Done
                  </Text>
                </AnimatedButton>
              )}
            </AnimatedCard>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
