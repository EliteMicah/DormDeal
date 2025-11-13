/**
 * Send push notification using Expo's Push Notification service
 * This can be called from your backend or edge functions
 */

interface PushMessage {
  to: string; // Expo push token
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  categoryId?: string;
  priority?: 'default' | 'normal' | 'high';
}

/**
 * Send a push notification to a specific Expo push token
 */
export async function sendPushNotification(
  message: PushMessage
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: message.to,
        title: message.title,
        body: message.body,
        data: message.data,
        sound: message.sound ?? 'default',
        badge: message.badge,
        channelId: message.channelId,
        categoryId: message.categoryId,
        priority: message.priority ?? 'high',
      }),
    });

    const result = await response.json();

    if (result.data && result.data[0] && result.data[0].status === 'error') {
      console.error('Error sending push notification:', result.data[0]);
      return { success: false, error: result.data[0].message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send push notifications to multiple recipients
 */
export async function sendBatchPushNotifications(
  messages: PushMessage[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    return { success: true };
  } catch (error) {
    console.error('Error sending batch push notifications:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Example: Send notification to user when they get a new message
 */
export async function notifyNewMessage(
  pushToken: string,
  senderName: string,
  messagePreview: string
): Promise<void> {
  await sendPushNotification({
    to: pushToken,
    title: `New message from ${senderName}`,
    body: messagePreview,
    data: { type: 'new_message', sender: senderName },
    sound: 'default',
  });
}

/**
 * Example: Send notification when a subscribed ISBN becomes available
 */
export async function notifyISBNAvailable(
  pushToken: string,
  bookTitle: string,
  isbn: string
): Promise<void> {
  await sendPushNotification({
    to: pushToken,
    title: 'Book Available! 📚',
    body: `${bookTitle} is now available for sale`,
    data: { type: 'isbn_match', isbn },
    sound: 'default',
  });
}
