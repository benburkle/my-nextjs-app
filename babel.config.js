module.exports = function(api) {
  api.cache(true);
  
  // Check if we're in a Next.js context (Turbopack/webpack)
  // by checking for Next.js-specific environment variables or callers
  const isNextJs = 
    process.env.NEXT_RUNTIME !== undefined ||
    process.env.NEXT_PHASE !== undefined ||
    (api.caller && api.caller.name === 'next-babel-turbo-loader') ||
    (api.caller && api.caller.name === 'next-babel-loader');
  
  // If Next.js is calling this, return empty config so it uses .babelrc instead
  if (isNextJs) {
    return {};
  }
  
  // Apply Expo config for React Native/Expo/Metro
  // babel-preset-expo already includes class properties transform
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
        },
      ],
    ],
  };
};


