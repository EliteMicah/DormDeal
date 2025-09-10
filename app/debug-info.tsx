import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DebugInfo() {
  const router = useRouter();

  // Get debug messages from global scope if they exist
  const debugMessages = (global as any).debugMessages || [
    "No debug messages found"
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1976d2' }}>
          Debug Info - ErrorBoundary Compatibility
        </Text>
        
        <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            Applied Compatibility Fixes:
          </Text>
          {debugMessages.map((msg: string, idx: number) => (
            <Text key={idx} style={{ fontSize: 14, marginBottom: 5, color: '#333' }}>
              • {msg}
            </Text>
          ))}
        </View>

        <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#e8f5e8', borderRadius: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            React & Environment Info:
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 5 }}>
            • React Version: {(React as any).version || 'Unknown'}
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 5 }}>
            • React.ErrorBoundary: {typeof (React as any).ErrorBoundary !== 'undefined' ? '✅ Available' : '❌ Missing'}
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 5 }}>
            • Global ErrorBoundary: {typeof (global as any).ErrorBoundary !== 'undefined' ? '✅ Available' : '❌ Missing'}
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 5 }}>
            • Hermes Engine: {typeof (global as any).__hermes_internal_use_engine_dependencies !== 'undefined' ? '✅ Detected' : '❌ Not Detected'}
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 5 }}>
            • TextEncoder: {typeof global.TextEncoder !== 'undefined' ? '✅ Available' : '❌ Missing'}
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 5 }}>
            • TextDecoder: {typeof global.TextDecoder !== 'undefined' ? '✅ Available' : '❌ Missing'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ 
            backgroundColor: '#007AFF', 
            padding: 15, 
            borderRadius: 8, 
            alignItems: 'center',
            marginBottom: 20
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            Continue to App
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/_sitemap')}
          style={{ 
            backgroundColor: '#4caf50', 
            padding: 15, 
            borderRadius: 8, 
            alignItems: 'center' 
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            Test Routes (Sitemap)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}