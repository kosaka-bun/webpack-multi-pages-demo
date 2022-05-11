//region import
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { DefinePlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
//endregion

//region 搜索src/pages目录下所有文件，添加对应的入口点与HTML编译插件
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
//endregion

//region 根据环境添加环境变量
const env = process.env.NODE_ENV;
let envVariables = {};
const envVariablesFilePath = path.join(__dirname, 'env', env + '.json');
if(fs.existsSync(envVariablesFilePath)) {
  const jsonStr = fs.readFileSync(envVariablesFilePath)
      .toString('utf-8');
  envVariables = JSON.parse(jsonStr);
  for(let key in envVariables) {
    envVariables[key] = JSON.stringify(envVariables[key]);
  }
}
//endregion

//region devtool
let devtool;
if(process.env.NODE_ENV === 'development') {
  devtool = 'inline-source-map';
}
//endregion

module.exports = {
  entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: './static/js/[name]-[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'babel-loader'
        ]
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
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
    new VueLoaderPlugin(),
    new DefinePlugin({
      'process.env': envVariables
    }),
    new MiniCssExtractPlugin({
      filename: './static/css/[name]-[chunkhash].css',
      chunkFilename: './static/css/[name]-[chunkhash].css'
    })
  ],
  resolve: {
    extensions: [ '.js', '.css' ],
    alias: {
      '@': path.join(__dirname, 'src')
    }
  },
  devServer: {
    port: 8080,
    watchFiles: [ './src/**/*' ],
    hot: true
  },
  devtool,
  performance: {
    maxEntrypointSize: 2 * 1024 * 1024,
    maxAssetSize: 2 * 1024 * 1024
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        parallel: true,
        terserOptions: {
          output: {
            comments: false
          }
        },
        extractComments: true
      })
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/
        },
      },
    }
  }
};