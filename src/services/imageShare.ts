import { RefObject } from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export async function captureCalendarView(
  viewRef: RefObject<View | null>
): Promise<string | null> {
  if (!viewRef.current) {
    return null;
  }

  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    return uri;
  } catch (error) {
    console.error('Error capturing view:', error);
    return null;
  }
}

export async function shareImage(uri: string): Promise<boolean> {
  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    console.error('Sharing is not available on this device');
    return false;
  }

  try {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Vardiya Takvimini Paylaş',
    });
    return true;
  } catch (error) {
    console.error('Error sharing image:', error);
    return false;
  }
}

export async function captureAndShare(
  viewRef: RefObject<View | null>
): Promise<{ success: boolean; error?: string }> {
  const uri = await captureCalendarView(viewRef);

  if (!uri) {
    return { success: false, error: 'Görüntü yakalanamadı' };
  }

  const shared = await shareImage(uri);

  if (!shared) {
    return { success: false, error: 'Paylaşım başarısız' };
  }

  return { success: true };
}
