import React, { useEffect, useState } from "react";
import { Image, ImageProps, View } from "react-native";
import { getImageUri } from "../utils/imageStorage";

interface AsyncImageProps extends Omit<ImageProps, "source"> {
  imageKey: string;
  fallbackComponent?: React.ReactNode;
}

export const AsyncImage: React.FC<AsyncImageProps> = ({
  imageKey,
  fallbackComponent,
  onError,
  ...props
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const uri = await getImageUri(imageKey);
        setImageUri(uri);
      } catch (error) {
        console.error("Error loading image:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (imageKey) {
      loadImage();
    }
  }, [imageKey]);

  const handleError = () => {
    setHasError(true);
    if (onError) {
      onError();
    }
  };

  if (isLoading) {
    return fallbackComponent || <View style={props.style} />;
  }

  if (hasError || !imageUri) {
    return fallbackComponent || <View style={props.style} />;
  }

  return <Image {...props} source={{ uri: imageUri }} onError={handleError} />;
};
