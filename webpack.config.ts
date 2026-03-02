import CopyWebpackPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv';
import Dotenv from 'dotenv-webpack';
import fs from 'fs';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import type { Configuration as WebpackConfiguration } from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deps = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')).dependencies;

const ModuleFederationPlugin = (webpack as any).container.ModuleFederationPlugin as any;
const requireC = createRequire(import.meta.url);
const printCompilationMessage = requireC('./compilation.config.js');

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

export default (_env: unknown, argv: { mode?: string }): Configuration => {
  const mode = argv.mode || 'development';
  dotenv.config({ path: path.resolve(__dirname, `.env.${mode}`) });
  const publicPath = process.env.RMU_MFE_STRATEGIC_PUBLIC_PATH || 'auto';

  return {
    output: {
      publicPath,
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },

    devServer: {
      allowedHosts: 'all',
      host: '0.0.0.0',
      port: 8082,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      watchFiles: [path.resolve(__dirname, 'src')],
      onListening: function (devServer) {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        const port =
          devServer.server?.address() && typeof devServer.server.address() === 'object'
            ? (devServer.server.address() as any).port
            : 8089;

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
      new (webpack as any).container.ModuleFederationPlugin({
        name: 'strategic',
        filename: 'strategic-app.js',
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
      }),
      new HtmlWebPackPlugin({
        template: './src/index.html',
      }),
      new Dotenv({
        path: `./.env.${argv.mode || 'development'}`,
        safe: false,
        systemvars: true,
        silent: false,
        defaults: './.env',
      }),
      new webpack.DefinePlugin({
        'process.env.RMU_API_STRATEGIC_URL': JSON.stringify(process.env.RMU_API_STRATEGIC_URL || ''),
      }),
    ],
  };
};
