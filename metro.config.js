const { getDefaultConfig } = require("expo/metro-config");
//import { withNativeWind } from "nativewind/metro";

const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

module.exports = config;
