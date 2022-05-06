//region import
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
//endregion

const pageNames = fs.readdirSync(path.join(__dirname, 'src', 'pages'));

const entry = {};
const plugins = [];

pageNames.forEach(name => {
  entry[name] = path.join(__dirname, 'src', 'pages', name, name + '.js');
  plugins.push(new HtmlWebpackPlugin({
    template: path.join(__dirname, 'src', 'pages', name, name + '.html'),
    filename: name + '.html',
    chunks: [ name ]
  }));
});

module.exports = {
  entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: './js/[name]-[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.vue$/,
        use: [
          'vue-loader'
        ]
      }
    ]
  },
  plugins: [
      ...plugins,
      new CleanWebpackPlugin(),
      new VueLoaderPlugin()
  ],
  resolve: {
    extensions: [ '.js', '.css' ],
    alias: {
      '@': path.join(__dirname, 'src')
    }
  },
  devServer: {
    watchFiles: [ './src/**/*' ],
    hot: true
  },
  devtool: "inline-source-map"
};