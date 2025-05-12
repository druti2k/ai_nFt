const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "assert": require.resolve("assert"),
    "url": require.resolve("url"),
    "os": require.resolve("os-browserify"),
    "path": require.resolve("path-browserify"),
    "process": require.resolve("process/browser"),
    "buffer": require.resolve("buffer"),
    "vm": require.resolve("vm-browserify")
  });
  config.resolve.fallback = fallback;

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ]);

  config.ignoreWarnings = [/Failed to parse source map/];
  
  return config;
} 