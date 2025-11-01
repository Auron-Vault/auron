import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGE_CACHE_PREFIX = 'coin_image_';

export interface CachedImage {
  uri: string;
  timestamp: number;
}

/**
 * Save image URL to AsyncStorage cache (permanent)
 */
export const cacheImageUrl = async (
  coinId: string,
  imageUrl: string,
): Promise<void> => {
  try {
    const cacheData: CachedImage = {
      uri: imageUrl,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      `${IMAGE_CACHE_PREFIX}${coinId}`,
      JSON.stringify(cacheData),
    );
  } catch (error) {
    console.error(`[ImageCache] Error caching image for ${coinId}:`, error);
  }
};

/**
 * Get cached image URL from AsyncStorage (never expires)
 */
export const getCachedImageUrl = async (
  coinId: string,
): Promise<string | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${IMAGE_CACHE_PREFIX}${coinId}`);
    if (!cached) {
      return null;
    }

    const cacheData: CachedImage = JSON.parse(cached);

    // Cache is permanent - no expiration check
    return cacheData.uri;
  } catch (error) {
    console.error(`[ImageCache] Error reading cache for ${coinId}:`, error);
    return null;
  }
};

/**
 * Cache multiple images at once
 */
export const cacheMultipleImages = async (images: {
  [coinId: string]: string;
}): Promise<void> => {
  const promises = Object.entries(images).map(([coinId, imageUrl]) =>
    cacheImageUrl(coinId, imageUrl),
  );
  await Promise.all(promises);
};

/**
 * Clear all cached images
 */
export const clearImageCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const imageKeys = keys.filter(key => key.startsWith(IMAGE_CACHE_PREFIX));
    await AsyncStorage.multiRemove(imageKeys);
  } catch (error) {
    console.error('[ImageCache] Error clearing cache:', error);
  }
};
