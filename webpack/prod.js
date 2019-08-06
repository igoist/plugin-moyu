const merge = require('webpack-merge');
const common = require('./common.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const publicPath = './';

module.exports = merge(common, {
  // devtool: 'inline-source-map',
  mode: 'production',
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
  output: {
    filename: '[name].[chunkhash:8].js',
    path: path.resolve(path.resolve(__dirname, '..'), 'dist/'),
    publicPath
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(path.resolve(__dirname, '..'), './public/index.html')
    }),
    // new UglifyJSPlugin({
    //   sourceMap: true,
    //   parallel: true
    // }),
    // new webpack.NamedChunksPlugin()
    new webpack.HashedModuleIdsPlugin({
      hashFunction: 'sha256',
      hashDigest: 'hex',
      hashDigestLength: 8
    })
  ],
  optimization: {
    splitChunks: {
      // chunks: 'all',
      cacheGroups: {
        vendors1: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendorx',
          chunks: 'all',
        }
      }
    }
  }
});
