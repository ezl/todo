const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const buildConfig = env => {
  let browser = 'chrome';

  const entry = {
    newtab: './src/newtab/index.js',
  };

  if (env.browser === 'firefox') {
    browser = 'firefox';
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
          },
          {
            from: './src/assets/images/extension-icons',
            to: 'images'
          },
        ]
      })
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

  switch (browser) {
    case 'chrome':
      baseManifest.action = {
        default_icon: {
          ...icons
        }
      };

      baseManifest.manifest_version = 3;
      break;

    case 'firefox':
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
