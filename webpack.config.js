const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const buildConfig = env => {
  let browser = 'chrome';

  const entry = {
    newtab: './src/newtab/index.js',
    'background-scripts/main': './src/background-scripts/main.js',
    sw: './src/sw.js'
  };

  if (env.browser === 'firefox') {
    browser = 'firefox';
    // Exclude service worker when building for Fiefox
    delete entry['sw'];
  }

  const outputPath = `dist/${browser}`;

  return {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry,
    resolve: {
      alias: {
        '@': path.resolve('./src')
      },
      extensions: ['.js', '.vue', '.css']
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: 'vue-loader'
        },
        {
          test: /\.js$/,
          loader: 'babel-loader'
        },

        {
          test: /\.css$/,
          use: ['vue-style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'images/[name].[ext]'
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          use: ['babel-loader', 'vue-svg-loader']
        }
      ]
    },
    output: {
      path: path.resolve(__dirname, outputPath),
      filename: '[name].js',
      clean: true
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, outputPath)
      },
      port: 3000,
      devMiddleware: {
        writeToDisk: true
      }
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: './src/newtab/index.html',
        filename: 'newtab.html',
        chunks: ['newtab']
      }),
      new CopyPlugin({
        patterns: [
          {
            from: './src/base-manifest.json',
            to: 'manifest.json',
            transform(content, absoluteFrom) {
              return buildManifestFile(content, browser);
            }
          }
        ]
      })
    ]
  };
};

const buildManifestFile = (buffer, browser) => {
  const baseManifest = JSON.parse(buffer.toString());
  const icons = {
    16: 'images/extension-icons/icon_16.png',
    48: 'images/extension-icons/icon_48.png',
    128: 'images/extension-icons/icon_128.png'
  };

  baseManifest.icons = {
    ...icons
  };

  switch (browser) {
    case 'chrome':
      baseManifest.action = {
        default_icon: {
          ...icons
        }
      };

      baseManifest.background = {
        service_worker: 'sw.js'
      };

      baseManifest.manifest_version = 3;
      break;

    case 'firefox':
      baseManifest.background = {
        scripts: ['background-scripts/main.js']
      };

      baseManifest.browser_action = {
        default_icon: {
          ...icons
        }
      };

      baseManifest.manifest_version = 2;
      break;

    default:
      break;
  }

  const manifest = JSON.stringify(baseManifest, null, 2);
  return manifest;
};

module.exports = buildConfig;
