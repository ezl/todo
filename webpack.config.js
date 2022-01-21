const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    newtab: './src/newtab/index.js',
    'background-scripts/main': './src/background-scripts/main.js',
    sw: './src/sw.js'
  },
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
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: '[name].js',
    clean: true
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist/')
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
          from: './src/manifest.json',
          to: 'manifest.json',
          transform(content, absoluteFrom) {
            return content;
          }
        }
      ]
    }),
  ]
};
