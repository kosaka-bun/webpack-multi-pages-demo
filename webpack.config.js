//region import
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { DefinePlugin } = require('webpack');
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

module.exports = {
  entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: './js/[name]-[chunkhash].js'
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
      new VueLoaderPlugin(),
      new DefinePlugin({
        'process.env': envVariables
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
  devtool: "inline-source-map",
  performance: {
    maxEntrypointSize: 10 * 1024 * 1024,
    maxAssetSize: 10 * 1024 * 1024
  }
};