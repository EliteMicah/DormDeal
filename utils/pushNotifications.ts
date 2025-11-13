import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../supabase-client';

/**
 * Configure how notifications are displayed when app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and get Expo Push Token
 * @param userId - The user's ID to associate with the push token
 * @returns The Expo push token or null if failed
 */
export async function registerForPushNotificationsAsync(
  userId?: string
): Promise<string | null> {
  let token: string | null = null;

  // Check if running on a physical device
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    // Get the Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'e3a564f3-52f5-456a-9aa4-ae6abaadbc44', // Your EAS project ID from app.json
    });
    token = tokenData.data;
    console.log('Expo Push Token:', token);

    // Store the token in the database if userId is provided
    if (userId && token) {
      await storePushToken(userId, token);
    }

    // iOS specific: Set notification categories if needed
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('default', [
        {
          identifier: 'view',
          buttonTitle: 'View',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);
    }
  } catch (error) {
    console.error('Error registering for push notifications:', error);
  }

  return token;
}

/**
 * Store the push token in Supabase
 */
async function storePushToken(userId: string, token: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_push_tokens')
      .upsert(
        {
          user_id: userId,
          push_token: token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

    if (error) throw error;
    console.log('Push token stored successfully');
  } catch (error) {
    console.error('Error storing push token:', error);
  }
}

/**
 * Remove push token from database (e.g., on logout)
 */
export async function removePushToken(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_push_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    console.log('Push token removed successfully');
  } catch (error) {
    console.error('Error removing push token:', error);
  }
}

/**
 * Set up notification listeners
 * @returns Cleanup function to remove listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
): () => void {
  // Listener for notifications received while app is foregrounded
  const notificationListener =
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification);
      onNotificationReceived?.(notification);
    });

  // Listener for when a notification is tapped
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      onNotificationTapped?.(response);
    });

  // Return cleanup function
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  seconds: number = 1
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: {
      seconds,
    },
  });

  return notificationId;
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
