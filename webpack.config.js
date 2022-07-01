const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const buildConfig = env => {
  if (!env.target) {
    throw 'Target is required';
  }

  const target = env.target;
  const outputPath = `dist/`;
  const copyPluginOptions = {
    patterns: [
      {
        from: './src/assets/images/favicon.ico',
        to: 'favicon.ico'
      }
    ]
  };
  const entry = {
    index: './src/app/index.js',
  }

  if(target === 'chrome'){
    entry['background-scripts/main'] = './src/browser-extension/background-scripts/main.js'
    entry['sw'] = './src/browser-extension/background-scripts/sw.js'
  }

  if(target === 'firefox'){
    entry['content-scripts/main'] = './src/browser-extension/content-scripts/main.js'
  }

  if (target !== 'web') {
    copyPluginOptions.patterns.push({
      from: './src/browser-extension/base-manifest.json',
      to: 'manifest.json',
      transform(content, absoluteFrom) {
        return buildManifestFile(content, target);
      }
    });

    copyPluginOptions.patterns.push({
      from: './src/assets/images/extension-icons',
      to: 'images'
    });
  }

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
      clean: true,
      publicPath: '',
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
        template: './src/app/index.html',
        filename: 'index.html',
        chunks: ['index'],
        title : target === 'web' ? 'Bad to do' : 'New tab',
      }),
      new CopyPlugin(copyPluginOptions),
      new webpack.DefinePlugin({
        APP_VERSION: JSON.stringify(process.env.npm_package_version),
      }),
    ]
  };
};

const buildManifestFile = (buffer, browser) => {
  const baseManifest = JSON.parse(buffer.toString());
  const icons = {
    16: 'images/icon_16.png',
    48: 'images/icon_48.png',
    128: 'images/icon_128.png'
  };

  baseManifest.icons = {
    ...icons
  };

  baseManifest.version = process.env.npm_package_version

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

      // Using this to allow the web page to communicate with the background script 
      // in order to get current version of the extension (if installed)
      baseManifest.externally_connectable = {
        matches: ["http://localhost:3000/*", "https://app.badtodo.com/*"]
      };

      baseManifest.manifest_version = 3;
      break;

    case 'firefox':
      baseManifest.browser_action = {
        default_icon: {
          ...icons
        }
      };

      baseManifest.background = {
        scripts: ['background-scripts/main.js']
      };

      baseManifest.content_scripts = [
        {
          js: ['content-scripts/main.js'],
          matches: ["http://localhost/*", "*://app.badtodo.com/*"]
        }
      ];

      baseManifest.manifest_version = 2;
      break;

    default:
      break;
  }

  const manifest = JSON.stringify(baseManifest, null, 2);
  return manifest;
};

module.exports = buildConfig;
