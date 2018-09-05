const path = require('path');

const webpack = require('webpack');
const AutoDllPlugin = require('autodll-webpack-plugin');
const yamljs = require('yamljs');
const FlowWebpackPlugin = require('flow-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const reportUrl = yamljs.parseFile('launcher-config.yaml').reportServer;

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: './source/renderer/index.js',
  output: {
    path: path.join(__dirname, './dist/renderer'),
    filename: 'index.js',
  },
  // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
  target: 'electron-renderer',
  cache: true,
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.node'],
    alias: {
      'scrypt.js$': path.resolve(__dirname, '..', '..', 'node_modules/scrypt.js/js.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: /source|storybook/,
        exclude: /source\/main/,
        use: {
          loader: 'eslint-loader',
        },
        enforce: 'pre',
      },
      {
        test: /\.jsx?$/,
        include: /source|storybook/,
        exclude: /source\/main/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.scss/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: '[name]_[local]',
              importLoaders: true,
            },
          },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
      {
        test: /\.inline\.svg$/,
        use: 'svg-inline-loader',
      },
      {
        test: /\.(woff2?|eot|ttf|otf|png|jpe?g|gif|svg)(\?.*)?$/,
        exclude: /\.inline\.svg$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name]-[hash].[ext]',
            outputPath: 'assets/',
          },
        },
      },
      {
        test: /\.md$/,
        use: [{ loader: 'html-loader', options: { importLoaders: true } }, { loader: 'markdown-loader?gfm=false' }],
      },
      {
        test: /(pdfkit|linebreak|fontkit|unicode|brotli|png-js).*\.js$/,
        use: {
          loader: 'transform-loader?brfs',
        },
      },
    ],
  },
  plugins: [
    // Set the ExtractTextPlugin output filename
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
    new webpack.DefinePlugin({
      'process.env.API': JSON.stringify(process.env.API || 'ada'),
      'process.env.API_VERSION': JSON.stringify(process.env.API_VERSION || 'dev'),
      'process.env.NETWORK': JSON.stringify(process.env.NETWORK || 'development'),
      'process.env.MOBX_DEV_TOOLS': process.env.MOBX_DEV_TOOLS || 0,
      'process.env.BUILD_NUMBER': JSON.stringify(process.env.BUILD_NUMBER || 'dev'),
      'process.env.REPORT_URL': JSON.stringify(reportUrl),
    }),
    new AutoDllPlugin({
      filename: 'vendor.dll.js',
      context: path.join(__dirname, '..'),
      entry: {
        vendor: [
          'aes-js',
          'bignumber.js',
          'bip39',
          'blakejs',
          'bs58',
          'classnames',
          'data.maybe',
          'es6-error',
          'humanize-duration',
          'lodash',
          'mobx',
          'mobx-react',
          'mobx-react-form',
          'mobx-react-router',
          'moment',
          'pbkdf2',
          'qrcode.react',
          'ramda',
          'react',
          'react-addons-css-transition-group',
          'react-copy-to-clipboard',
          'react-css-themr',
          'react-dom',
          'react-dropzone',
          'react-number-format',
          'react-router',
          'react-svg-inline',
          'recharts',
          'route-parser',
          'rxjs',
          'safe-buffer',
          'unorm',
          'validator',
        ],
      },
    }),
    new FlowWebpackPlugin(),
  ].filter(Boolean),
};
