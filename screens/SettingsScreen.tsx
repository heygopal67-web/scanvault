import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";
import {
  AnimatedCard,
  AnimatedSlideIn,
} from "../components/AnimatedComponents";
import AppInformationModal from "../components/AppInformationModal";
import { Colors } from "../constants/Colors";
import { useApp } from "../context/AppContext";
import { ReceiptStorage } from "../storage/receiptStorage";

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const [showAppInfoModal, setShowAppInfoModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const currencies = [
    { symbol: "$", name: "USD" },
    { symbol: "€", name: "EUR" },
    { symbol: "£", name: "GBP" },
    { symbol: "¥", name: "JPY" },
    { symbol: "₹", name: "INR" },
    { symbol: "₽", name: "RUB" },
    { symbol: "₩", name: "KRW" },
    { symbol: "₪", name: "ILS" },
    { symbol: "₦", name: "NGN" },
    { symbol: "₨", name: "PKR" },
    { symbol: "₴", name: "UAH" },
    { symbol: "₸", name: "KZT" },
  ];

  // const toggleAutoClean = async (enabled: boolean) => {
  //   try {
  //     await ReceiptStorage.saveAutoCleanSettings({
  //       enabled,
  //       days: state.autoCleanDays,
  //     });
  //     dispatch({ type: "TOGGLE_AUTO_CLEAN", payload: enabled });
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to update auto-clean settings");
  //   }
  // };

  // const setAutoCleanDays = async (days: number) => {
  //   try {
  //     await ReceiptStorage.saveAutoCleanSettings({
  //       enabled: state.autoCleanEnabled,
  //       days,
  //     });
  //     dispatch({ type: "SET_AUTO_CLEAN_DAYS", payload: days });
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to update auto-clean days");
  //   }
  // };

  const setCurrency = async (currency: string) => {
    try {
      await ReceiptStorage.saveCurrencySettings({ currency });
      dispatch({ type: "SET_CURRENCY", payload: currency });
    } catch (error) {
      Alert.alert("Error", "Failed to update currency settings");
    }
  };

  // const runAutoClean = async () => {
  //   try {
  //     const result = await ReceiptStorage.cleanOldReceipts();
  //     if (result.deletedCount > 0) {
  //       Alert.alert(
  //         "Auto-Clean Complete",
  //         `Deleted ${result.deletedCount} old receipt(s) and ${result.totalDeleted} associated image(s).`
  //       );
  //       // Refresh receipts list
  //       const updatedReceipts = await ReceiptStorage.getAllReceipts();
  //       dispatch({ type: "SET_RECEIPTS", payload: updatedReceipts });
  //     } else {
  //       Alert.alert("Auto-Clean", "No old receipts found to delete.");
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to run auto-clean");
  //   }
  // };

  // const exportData = async () => {
  //   try {
  //     const data = await ReceiptStorage.exportData();
  //     const dataString = JSON.stringify(data, null, 2);

  //     const fileUri = `${FileSystem.documentDirectory}scanvault_export_${
  //       new Date().toISOString().split("T")[0]
  //     }.json`;
  //     await FileSystem.writeAsStringAsync(fileUri, dataString);

  //     if (await Sharing.isAvailableAsync()) {
  //       await Sharing.shareAsync(fileUri, {
  //         mimeType: "application/json",
  //         dialogTitle: "Export ScanVault Data",
  //       });
  //     } else {
  //       Alert.alert("Export", "Sharing not available on this device");
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to export data");
  //   }
  // };

  const exportDataAsCSV = async () => {
    try {
      const data = await ReceiptStorage.exportData();

      // Create CSV content
      let csvContent = "Vendor,Amount,Date,Notes,Tags,Image URI,Created At\n";

      data.receipts.forEach((receipt) => {
        const tags = receipt.tags.join(";");
        const notes = receipt.notes?.replace(/"/g, '""') || "";
        csvContent += `"${receipt.vendor}",${receipt.amount},"${
          receipt.date
        }","${notes}","${tags}","${receipt.imageUri || ""}","${
          receipt.createdAt
        }"\n`;
      });

      const fileUri = `${FileSystem.documentDirectory}scanvault_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export ScanVault Data (CSV)",
        });
      } else {
        Alert.alert("Export", "Sharing not available on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export data as CSV");
    }
  };

  const clearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all receipts and categories. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All Data",
          style: "destructive",
          onPress: async () => {
            try {
              await ReceiptStorage.clearAllData();
              dispatch({ type: "SET_RECEIPTS", payload: [] });
              dispatch({ type: "SET_CATEGORIES", payload: [] });
              Alert.alert("Success", "All data has been cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    iconColor?: string
  ) => (
    <AnimatedCard
      onPress={onPress}
      style={{
        backgroundColor: Colors.light.card,
        borderColor: Colors.light.borderPrimary,
        borderWidth: 0.5, // reduced border width
        marginBottom: 12, // slightly tighter spacing
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 18,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}
    >
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center flex-1`}>
          {/* Icon Container */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: iconColor || Colors.light.secondary,
            }}
          >
            <Ionicons name={icon} size={20} color={Colors.light.card} />
          </View>

          {/* Title + Subtitle */}
          <View style={tw`flex-1 ml-3`}>
            <Text
              style={[
                tw`text-base font-semibold`,
                { color: Colors.light.text, letterSpacing: 0.3 },
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  tw`text-sm mt-0.5`,
                  { color: Colors.light.textSecondary, lineHeight: 18 },
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Right Component */}
        {rightComponent}
      </View>
    </AnimatedCard>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={tw`mb-6`}>
      <Text
        style={[
          tw`text-lg font-bold mb-1 px-1`, // smaller text & tighter spacing
          { color: Colors.light.text },
        ]}
      >
        {title}
      </Text>
      {children}
    </View>
  );

  return (
    <>
      <ScrollView
        style={[tw`flex-1`, { backgroundColor: Colors.light.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ zIndex: 1 }}
      >
        <View style={[tw`px-6 py-5 relative`, { zIndex: 999 }]}>
          {/* Data Management */}
          <AnimatedSlideIn direction="up" delay={400} duration={500}>
            {renderSection(
              "Data Management",
              <>
                {renderSettingItem(
                  "document-text",
                  "Export CSV",
                  "Export receipts as spreadsheet",
                  exportDataAsCSV,
                  undefined,
                  "#2196F3"
                )}

                {renderSettingItem(
                  "trash",
                  "Clear All",
                  "Permanently delete all data",
                  clearAllData,
                  undefined,
                  "#F44336"
                )}
              </>
            )}
          </AnimatedSlideIn>

          {/* Currency Selection */}
          <AnimatedSlideIn direction="up" delay={300} duration={500}>
            <View style={{ position: "relative", zIndex: 1000 }}>
              {renderSection(
                "Currency",
                renderSettingItem(
                  "cash",
                  "Currency Selection",
                  `Current: ${
                    currencies.find((c) => c.symbol === state.selectedCurrency)
                      ?.name
                  } (${state.selectedCurrency})`,
                  undefined,
                  <TouchableOpacity
                    onPress={() => setShowDropdown(!showDropdown)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor: Colors.light.primary,
                      minWidth: 60,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.light.card,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {state.selectedCurrency}
                    </Text>
                  </TouchableOpacity>,
                  "#4CAF50"
                )
              )}

              {/* Currency Dropdown */}
              {showDropdown && (
                <View
                  style={{
                    position: "absolute",
                    right: 10,
                    top: -130,
                    zIndex: 9999,
                    backgroundColor: Colors.light.card,
                    borderColor: Colors.light.borderPrimary,
                    borderWidth: 0.5,
                    borderRadius: 12,
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 10,
                    maxHeight: 220,
                    minWidth: 70,
                    overflow: "hidden",
                  }}
                >
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                  >
                    {currencies.map((currency, index) => {
                      const isSelected =
                        state.selectedCurrency === currency.symbol;
                      return (
                        <TouchableOpacity
                          key={currency.symbol}
                          onPress={() => {
                            setCurrency(currency.symbol);
                            setShowDropdown(false);
                          }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 10,
                            paddingHorizontal: 10,
                            backgroundColor: isSelected
                              ? Colors.light.primary
                              : Colors.light.card,
                            borderBottomWidth:
                              index < currencies.length - 1 ? 0.5 : 0,
                            borderBottomColor: Colors.light.border,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: isSelected
                                ? Colors.light.card
                                : Colors.light.text,
                              marginRight: 8,
                            }}
                          >
                            {currency.symbol}
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              flex: 1,
                              color: isSelected
                                ? Colors.light.card
                                : Colors.light.text,
                            }}
                            numberOfLines={1}
                          >
                            {currency.name}
                          </Text>
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={Colors.light.card}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </AnimatedSlideIn>

          {/* About */}
          <AnimatedSlideIn direction="up" delay={500} duration={500}>
            <View style={{ zIndex: 1 }}>
              {renderSection(
                "About Us",
                <>
                  {renderSettingItem(
                    "information-circle",
                    "App Info",
                    "Learn more about ScanVault",
                    () => setShowAppInfoModal(true),
                    undefined,
                    "#9C27B0"
                  )}

                  {renderSettingItem(
                    "help-circle",
                    "Support",
                    "Get help and contact us",
                    () =>
                      Alert.alert(
                        "Help & Support",
                        "For support, please contact us at heygopal67@gmail.com.",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Email Us",
                            onPress: () =>
                              Linking.openURL("mailto:heygopal67@gmail.com"),
                          },
                        ]
                      ),
                    undefined,
                    "#FF9800"
                  )}
                </>
              )}
            </View>
          </AnimatedSlideIn>
          {/* Auto-Clean
          <AnimatedSlideIn direction="up" delay={400} duration={500}>
            {renderSection(
              "Auto-Clean",
              <>
                {renderSettingItem(
                  "trash",
                  "Auto-Clean",
                  `Automatically delete receipts older than ${state.autoCleanDays} days`,
                  undefined,
                  <Switch
                    value={state.autoCleanEnabled}
                    onValueChange={toggleAutoClean}
                    trackColor={{
                      false: Colors.light.border,
                      true: Colors.light.secondary,
                    }}
                    thumbColor={
                      state.autoCleanEnabled
                        ? Colors.light.primary
                        : Colors.light.card
                    }
                  />,
                  "#FF6B6B"
                )}

                {state.autoCleanEnabled && (
                  <AnimatedCard
                    style={{
                      backgroundColor: Colors.light.card,
                      borderColor: Colors.light.borderPrimary,
                      borderWidth: 0.5,
                      marginBottom: 12,
                      borderRadius: 16,
                      paddingVertical: 16,
                      paddingHorizontal: 18,
                      shadowColor: "#000",
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 3 },
                      elevation: 2,
                    }}
                  >
                    <View style={tw`flex-row items-center justify-between`}>
                      <View style={tw`flex-row items-center flex-1`}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#4ECDC4",
                          }}
                        >
                          <Ionicons
                            name="calendar"
                            size={20}
                            color={Colors.light.card}
                          />
                        </View>
                        <View style={tw`flex-1 ml-3`}>
                          <Text
                            style={[
                              tw`text-base font-semibold`,
                              { color: Colors.light.text, letterSpacing: 0.3 },
                            ]}
                          >
                            Days to Keep
                          </Text>
                          <Text
                            style={[
                              tw`text-sm mt-0.5`,
                              {
                                color: Colors.light.textSecondary,
                                lineHeight: 18,
                              },
                            ]}
                          >
                            Receipts older than {state.autoCleanDays} days will
                            be deleted
                          </Text>
                        </View>
                      </View>
                      <View style={tw`flex-row items-center`}>
                        <Text
                          style={[
                            tw`text-lg font-bold mr-3`,
                            { color: Colors.light.primary },
                          ]}
                        >
                          {state.autoCleanDays}
                        </Text>
                        <View style={tw`flex-row`}>
                          <AnimatedCard
                            onPress={() =>
                              setAutoCleanDays(
                                Math.max(7, state.autoCleanDays - 7)
                              )
                            }
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: Colors.light.border,
                            }}
                          >
                            <Ionicons
                              name="remove"
                              size={16}
                              color={Colors.light.text}
                            />
                          </AnimatedCard>
                          <AnimatedCard
                            onPress={() =>
                              setAutoCleanDays(state.autoCleanDays + 7)
                            }
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: Colors.light.primary,
                              marginLeft: 8,
                            }}
                          >
                            <Ionicons
                              name="add"
                              size={16}
                              color={Colors.light.card}
                            />
                          </AnimatedCard>
                        </View>
                      </View>
                    </View>
                  </AnimatedCard>
                )}
              </>
            )}
          </AnimatedSlideIn> */}
        </View>
      </ScrollView>

      <AppInformationModal
        visible={showAppInfoModal}
        onClose={() => setShowAppInfoModal(false)}
      />
    </>
  );
}
