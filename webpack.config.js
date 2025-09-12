/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');

const deps = require('./package.json').dependencies;

const printCompilationMessage = require('./compilation.config.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (_, argv) => ({
  output: {
    // publicPath: process.env.RMU_FE_STRATEGIC_PUBLIC_PATH || "http://localhost:8082/"
    //publicPath: "http://fe-strategic.rmu.local/"
    publicPath: 'http://localhost:8082/',
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },

  devServer: {
    allowedHosts: 'all',
    host: '0.0.0.0',
    port: 8082,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    historyApiFallback: true,
    watchFiles: [path.resolve(__dirname, 'src')],
    onListening: function (devServer) {
      const port = devServer.server.address().port;
      printCompilationMessage('compiling', port);
      devServer.compiler.hooks.done.tap('OutputMessagePlugin', (stats) => {
        setImmediate(() => {
          if (stats.hasErrors()) {
            printCompilationMessage('failure', port);
          } else {
            printCompilationMessage('success', port);
          }
        });
      });
    },
  },

  module: {
    rules: [
      {
        test: /\.m?js/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|jfif)$/i,
        use: ['file-loader'],
      },
      {
        test: /\.json$/,
        type: 'javascript/auto',
        use: 'json-loader',
      },
    ],
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public'),
          to: path.resolve(__dirname, 'dist'),
        },
      ],
    }),
    new ModuleFederationPlugin({
      name: 'strategic',
      filename: 'strategic-app.js',
      remotes: {},
      exposes: {
        './StrategicApp': './src/App.tsx',
      },
      shared: {
        // react: { singleton: true, strictVersion: true, requiredVersion: deps.react },
        // 'react-dom': { singleton: true, strictVersion: true, requiredVersion: deps["react-dom"] },
        // 'react-router-dom': { singleton: true, strictVersion: true, requiredVersion: deps["react-router-dom"] },
        // '@mui/material': { singleton: true, strictVersion: true, requiredVersion: deps["@mui/material"] },
        // '@mui/icons-material': { singleton: true, strictVersion: true, requiredVersion: deps["@mui/icons-material"] },
        // '@emotion/react': { singleton: true, strictVersion: true, requiredVersion: deps["@emotion/react"] },
        // '@emotion/styled': { singleton: true, strictVersion: true, requiredVersion: deps["@emotion/styled"] },
        // 'keycloak-js': { singleton: true, strictVersion: true, requiredVersion: deps["keycloak-js"] },

        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
        'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
        '@mui/material': { singleton: true, requiredVersion: deps['@mui/material'] },
        '@mui/icons-material': { singleton: true, requiredVersion: deps['@mui/icons-material'] },
        '@emotion/react': { singleton: true, requiredVersion: deps['@emotion/react'] },
        '@emotion/styled': { singleton: true, requiredVersion: deps['@emotion/styled'] },
        // 'keycloak-js': { singleton: true, strictVersion: true, requiredVersion: deps["keycloak-js"] },
      },
    }),
    new HtmlWebPackPlugin({
      template: './src/index.html',
    }),
    new Dotenv({
      path: './.env',
      safe: false,
      systemvars: true,
      silent: false,
    }),
  ],
});
