import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Sitemap() {
  const router = useRouter();

  const routes = [
    // Main tabs
    { name: 'Home', route: '/(tabs)/home' },
    { name: 'Search', route: '/(tabs)/search' },
    { name: 'Create', route: '/(tabs)/create' },
    { name: 'Messages', route: '/(tabs)/messages' },
    { name: 'Profile', route: '/(tabs)/profile' },
    
    // Account creation flows
    { name: 'Sign Up', route: '/(tabs)/accountCreation/account/signUpScreen' },
    { name: 'Login', route: '/(tabs)/accountCreation/account/loginScreen' },
    
    // Home screens
    { name: 'Chat Screen', route: '/(tabs)/home/homeScreens/chatScreen' },
    
    // Create screens
    { name: 'Create Book Listing', route: '/(tabs)/create/createScreens/createBookListing' },
    { name: 'Create Event Listing', route: '/(tabs)/create/createScreens/createEventListing' },
    { name: 'Create Item Listing', route: '/(tabs)/create/createScreens/createItemListing' },
    
    // Modals
    { name: 'Edit Profile Modal', route: '/editProfileModal' },
    { name: 'Search Modal', route: '/searchModal' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <ScrollView>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          App Sitemap - Route Debugger
        </Text>
        <Text style={{ marginBottom: 20, color: '#666' }}>
          Navigate to each route to test for ErrorBoundary crashes
        </Text>
        
        {routes.map((route, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              console.log(`Testing route: ${route.route}`);
              try {
                router.push(route.route as any);
              } catch (error) {
                console.error(`Error navigating to ${route.route}:`, error);
              }
            }}
            style={{
              padding: 15,
              backgroundColor: '#f0f0f0',
              marginBottom: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500' }}>{route.name}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{route.route}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}