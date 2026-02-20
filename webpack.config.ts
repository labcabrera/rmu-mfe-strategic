/* eslint-disable no-unused-vars */
import CopyWebpackPlugin from 'copy-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import webpack, { Configuration } from 'webpack';

const ModuleFederationPlugin = (webpack as any).container.ModuleFederationPlugin as any;
const requireC = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const deps = requireC('./package.json').dependencies;
const printCompilationMessage = requireC('./compilation.config.js');

export default (_: any, argv: any): Configuration & { devServer?: any } => ({
  output: {
    publicPath: process.env.RMU_MFE_STRATEGIC_PUBLIC_PATH || 'http://localhost:8082/',
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
    onListening: function (devServer: any) {
      const port = devServer.server.address().port;
      printCompilationMessage('compiling', port);
      devServer.compiler.hooks.done.tap('OutputMessagePlugin', (stats: any) => {
        setImmediate(() => {
          if (stats.hasErrors()) {
            printCompilationMessage('failure', port);
          } else {
            printCompilationMessage('success', port);
          }
        });
      });
    },
  } as any,

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
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
        'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
        '@mui/material': { singleton: true, requiredVersion: deps['@mui/material'] },
        '@mui/icons-material': { singleton: true, requiredVersion: deps['@mui/icons-material'] },
        '@emotion/react': { singleton: true, requiredVersion: deps['@emotion/react'] },
        '@emotion/styled': { singleton: true, requiredVersion: deps['@emotion/styled'] },
      },
    } as any),
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
