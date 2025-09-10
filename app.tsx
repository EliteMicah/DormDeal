import "react-native-gesture-handler";
import "react-native-reanimated";
import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

// Initialize AsyncStorage for production builds with error handling
import AsyncStorage from "@react-native-async-storage/async-storage";

// Wrap AsyncStorage methods to prevent crashes
if (!__DEV__) {
  const originalGetItem = AsyncStorage.getItem;
  const originalSetItem = AsyncStorage.setItem;
  const originalRemoveItem = AsyncStorage.removeItem;
  
  AsyncStorage.getItem = async (key) => {
    try {
      return await originalGetItem.call(AsyncStorage, key);
    } catch (e) {
      console.warn('AsyncStorage.getItem failed:', e);
      return null;
    }
  };
  
  AsyncStorage.setItem = async (key, value) => {
    try {
      return await originalSetItem.call(AsyncStorage, key, value);
    } catch (e) {
      console.warn('AsyncStorage.setItem failed:', e);
      return;
    }
  };
  
  AsyncStorage.removeItem = async (key) => {
    try {
      return await originalRemoveItem.call(AsyncStorage, key);
    } catch (e) {
      console.warn('AsyncStorage.removeItem failed:', e);
      return;
    }
  };
}

// Add comprehensive error handlers for production
if (!__DEV__) {
  // Global exception handler
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Filter out known native module warnings that cause crashes
    const message = args.join(' ');
    if (message.includes('TurboModuleRegistry') || 
        message.includes('RCTExecuteOnMainQueue') ||
        message.includes('HiddenClass') ||
        message.includes('objc_exception_rethrow') ||
        message.includes('performVoidMethodInvocation')) {
      return; // Suppress these specific errors
    }
    originalConsoleError(...args);
  };

  // Override global Promise rejection handler
  const originalHandler = global.HermesInternal?.enablePromiseRejectionTracker;
  if (originalHandler) {
    global.HermesInternal.enablePromiseRejectionTracker = function(options) {
      try {
        return originalHandler.call(this, options);
      } catch (e) {
        // Silently handle promise rejection tracker errors
        return;
      }
    };
  }
}

export default function App() {
  const ctx = require.context("./app");
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
