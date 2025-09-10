const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Disable package exports to avoid Supabase compatibility issues with New Architecture
config.resolver.unstable_enablePackageExports = false;

// Add resolver configuration for better module resolution
config.resolver = {
  ...config.resolver,
  alias: {
    ...config.resolver.alias,
    // Ensure proper resolution of @supabase/supabase-js
    "@supabase/supabase-js": require.resolve("@supabase/supabase-js"),
    // Add alias for project root
    "@": __dirname,
  },
  // Add additional extensions for better compatibility
  sourceExts: [...config.resolver.sourceExts, "mjs", "cjs"],
  // Ensure node_modules are properly resolved
  nodeModulesPaths: [
    ...config.resolver.nodeModulesPaths,
    require("path").resolve(__dirname, "node_modules"),
  ],
};

// Apply NativeWind configuration
module.exports = withNativeWind(config, { input: "./global.css" });
