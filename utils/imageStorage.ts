import AsyncStorage from "@react-native-async-storage/async-storage";

// Function to get image URI from AsyncStorage
export const getImageUri = async (imageKey: string): Promise<string | null> => {
  try {
    // Check if the key starts with our prefix (stored image)
    if (imageKey.startsWith('receipt_image_')) {
      const base64Data = await AsyncStorage.getItem(imageKey);
      if (base64Data) {
        return `data:image/jpeg;base64,${base64Data}`;
      }
    }
    // If it's not a stored image key, return the original URI
    return imageKey;
  } catch (error) {
    console.error('Error retrieving image:', error);
    return imageKey; // Fallback to original key
  }
};

// Function to check if an image key is a stored image
export const isStoredImage = (imageKey: string): boolean => {
  return imageKey.startsWith('receipt_image_');
};

// Function to clean up old images (optional)
export const cleanupOldImages = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const imageKeys = keys.filter(key => key.startsWith('receipt_image_'));
    
    // You can implement cleanup logic here if needed
    console.log(`Found ${imageKeys.length} stored images`);
  } catch (error) {
    console.error('Error cleaning up images:', error);
  }
};
