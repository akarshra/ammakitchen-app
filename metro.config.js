const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable Watchman to avoid macOS TCC permission errors on Desktop folder
config.resolver.useWatchman = false;

module.exports = config;
