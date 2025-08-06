import React, { useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';

interface SafeAvatarProps {
  uri?: string | null;
  size?: number;
  fallbackText?: string;
  style?: any;
}

export const SafeAvatar: React.FC<SafeAvatarProps> = ({
  uri,
  size = 40,
  fallbackText = "?",
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = (error: any) => {
    console.log('Avatar image failed to load:', error.nativeEvent?.error || 'Unknown error');
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const avatarSize = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  // Show fallback if no URI provided or image failed to load
  if (!uri || imageError) {
    return (
      <View style={[styles.fallback, avatarSize, style]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>
          {fallbackText.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <View style={[avatarSize, style]}>
      <Image
        source={{ uri }}
        style={[styles.image, avatarSize]}
        onError={handleImageError}
        onLoad={handleImageLoad}
        resizeMode="cover"
      />
      {isLoading && (
        <View style={[styles.loading, avatarSize]}>
          <Text style={[styles.loadingText, { fontSize: size * 0.3 }]}>...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    position: 'absolute',
  },
  fallback: {
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loading: {
    position: 'absolute',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
  },
});