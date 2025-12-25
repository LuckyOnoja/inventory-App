module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Remove this line if it exists:
      // 'react-native-reanimated/plugin'
    ]
  };
};