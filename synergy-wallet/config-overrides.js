// config-overrides.js
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = function override(config) {
  // --- polyfills you already had ---
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve("buffer/"),
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert/"),
  };
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  // --- NEW: copy WASM files ---
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public/pqc"),
          to: "pqc",                 // will be served at /pqc/...
          noErrorOnMissing: false,   // fail if files missing
        },
      ],
    })
  );

  // Optional: set correct MIME for .wasm in dev
  config.devServer = config.devServer || {};
  config.devServer.setupMiddlewares = (middlewares, devServer) => {
    devServer.app.get("*.wasm", (_req, res, next) => {
      res.set("Content-Type", "application/wasm");
      next();
    });
    return middlewares;
  };

  return config;
};
