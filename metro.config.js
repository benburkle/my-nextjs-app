const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for web file extensions
config.resolver.sourceExts.push('web.js', 'web.ts', 'web.tsx');

// Configure Metro to transform React Native source files
// React Native 0.81.5 (Expo SDK 54) - configuration for Next.js + Expo unified setup
config.transformer = {
  ...config.transformer,
  // Enable transformation for all files including node_modules
  unstable_allowRequireContext: true,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Add watchFolders to ensure React Native is watched and can be transformed
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(__dirname, 'node_modules/react-native'),
];

// Configure resolver to exclude Next.js directories and allow React Native to be transformed
const appDir = path.resolve(__dirname, 'app');
const pagesDir = path.resolve(__dirname, 'pages');
const nextDir = path.resolve(__dirname, '.next');
const reactNativeDir = path.resolve(__dirname, 'node_modules/react-native');

// Get default blockList and add our exclusions
const defaultBlockList = config.resolver.blockList || [];
const blockListArray = Array.isArray(defaultBlockList) 
  ? defaultBlockList 
  : (defaultBlockList instanceof RegExp ? [defaultBlockList] : []);

config.resolver = {
  ...config.resolver,
  // Block Next.js directories from being processed by Metro
  // But ensure React Native is NOT blocked so it can be transformed
  blockList: [
    ...blockListArray.filter((pattern) => {
      // Remove any patterns that would block React Native
      const patternStr = String(pattern);
      return !patternStr.includes('react-native');
    }),
    // Block Next.js app directory
    new RegExp(appDir.replace(/\\/g, '\\\\') + '.*'),
    // Block pages directory if it exists
    new RegExp(pagesDir.replace(/\\/g, '\\\\') + '.*'),
    // Block .next directory
    new RegExp(nextDir.replace(/\\/g, '\\\\') + '.*'),
  ],
  // Ensure React Native can be resolved and transformed
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    'react-native': reactNativeDir,
  },
  // Enable package exports to allow Metro to transform react-native
  unstable_enablePackageExports: true,
};

module.exports = config;


