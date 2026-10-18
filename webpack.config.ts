import CopyWebpackPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv';
import fs from 'fs';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Configuration as WebpackConfiguration } from 'webpack';
import webpack from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import printCompilationMessage from './compilation.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deps = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')).dependencies;

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

// Runtime configuration. The keys listed in public/env-config.template.js are not baked into the
// bundle: every `process.env.<KEY>` (in src/ and in rmu-react-shared-lib) is rewritten to read
// window.__RMU_CONFIG__, which env-config.js sets before the bundle runs. The Docker image renders
// the template with envsubst; the dev server serves the same keys from .env.
const envConfigTemplate = fs.readFileSync(path.resolve(__dirname, 'public/env-config.template.js'), 'utf8');
const runtimeConfigKeys = Array.from(envConfigTemplate.matchAll(/\$\{([A-Z0-9_]+)\}/g), (match) => match[1]);
const runtimeConfigDefines = Object.fromEntries(
  runtimeConfigKeys.map((key) => [`process.env.${key}`, `(window.__RMU_CONFIG__ || {})[${JSON.stringify(key)}]`])
);
const renderEnvConfig = (): string =>
  `window.__RMU_CONFIG__ = ${JSON.stringify(Object.fromEntries(runtimeConfigKeys.map((key) => [key, process.env[key] ?? ''])))};\n`;

export default (_env: unknown, argv: { mode?: string }): Configuration => {
  const mode = argv.mode || 'development';
  // `.env.<mode>` overrides the shared `.env` (dotenv keeps the first value it finds).
  dotenv.config({ path: [path.resolve(__dirname, `.env.${mode}`), path.resolve(__dirname, '.env')], quiet: true });
  const port = process.env.PORT ? Number(process.env.PORT) : 8082;
  return {
    output: {
      // Chunks load from wherever strategic-app.js was loaded (gateway /mfe/strategic/, dev server, CDN).
      publicPath: 'auto',
      devtoolNamespace: 'strategic',
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      // rmu-react-shared-lib is a file: link outside this folder: resolve its peer dependencies (react,
      // MUI…) from this app first so the bundle has a single copy of each.
      modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
    },

    devServer: {
      allowedHosts: 'all',
      host: '0.0.0.0',
      port,
      historyApiFallback: true,
      // The page is served by the gateway (http://localhost), so HMR connects straight to the dev server.
      client: {
        webSocketURL: `ws://localhost:${port}/ws`,
      },
      setupMiddlewares: (middlewares, devServer) => {
        devServer.app?.get('/env-config.js', (_req, res) => {
          res.type('application/javascript').send(renderEnvConfig());
        });
        return middlewares;
      },
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
            : 8082;

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
          'react-oidc-context': { singleton: true, requiredVersion: deps['react-oidc-context'] },
          'oidc-client-ts': { singleton: true, requiredVersion: deps['oidc-client-ts'] },
          i18next: { singleton: true, requiredVersion: deps.i18next },
          'react-i18next': { singleton: true, requiredVersion: deps['react-i18next'] },
        },
      }),
      new HtmlWebPackPlugin({
        template: './src/index.html',
      }),
      new webpack.DefinePlugin(runtimeConfigDefines),
    ],
  };
};
