const path = require('path');
const preprocessor = require('preprocess');
const { AotPlugin } = require('@mcph/ngtools-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function getBundlePath(ref) {
  return path.join(__dirname, '../src/bundles', ref);
}

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
        loader: '@mcph/ngtools-webpack',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      hash: true,
    }),

    new AotPlugin({
      tsConfigPath: path.resolve(__dirname, '../tsconfig.json'),
      entryModule: getBundlePath('main/main.module#MainModule'),
      transform: (source, fileName) => {
        if (fileName.includes('node_modules') || path.extname(fileName) !== '.ts') {
          return source;
        }

        source = source.replace(/System\.import\(.(.+\.module).\)/g, '({ loadAoT: "$1" })');
        return preprocessor.preprocess(source, { IS_AOT: true }, { type: 'ts' });
      },
      additionalBundles: ['lazy/lazy.module.ts#LazyModule'].map(getBundlePath),
    }),
  ],
};
