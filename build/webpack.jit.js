const path = require('path');
const preprocessor = require('preprocess');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  context: path.resolve(__dirname, '..'),
  entry: {
    main: path.resolve(__dirname, '../src/index.ts'),
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'bundles/[name].bundle.js',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      hash: true,
    }),
  ],
};
