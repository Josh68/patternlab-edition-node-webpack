// webpack.config.js
const webpack = require('webpack');
const { resolve } = require('path');
const globby = require('globby');
const { getIfUtils, removeEmpty } = require('webpack-config-utils');
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const plConfig = require('./patternlab-config.json');
const cleanPublic = plConfig.cleanPublic;
const patternlab = require('@pattern-lab/core')(plConfig);
const patternEngines = require('@pattern-lab/core/lib/pattern_engines');
const merge = require('webpack-merge');
const customization = require(`${plConfig.paths.source.app}/webpack.app.js`);

module.exports = env => {
  const { ifProd, ifDev } = getIfUtils(env);
  const assetsToWatch = plConfig.transformedAssetTypes.join('|');

  const config = merge.smartStrategy(plConfig.webpackMerge)({
    devtool: ifDev('source-map'),
    context: resolve(__dirname, 'source'),
    node: {
      fs: "empty"
    },
    entry: {
      // Gathers any Source JS files and creates a bundle
      //NOTE: This name can be changed, if so, make sure to update _meta/01-foot.mustache
      "js/pl-source":
        globby.sync([resolve(plConfig.paths.source.js + '**/*.js')]).map(function (filePath) {
          return filePath;
        })
    },
    output: {
      path: resolve(__dirname, 'public'),
      filename: '[name].js'
    },
    plugins: removeEmpty([
      // ifDev(
      //   // Live reloading in development only
      //   new webpack.HotModuleReplacementPlugin()
      // ),
      ifProd(
        new webpack.optimize.UglifyJsPlugin({
          // Compresses in production any bundle
          sourceMap: true,
          uglifyOptions: {
            mangle: false
          }
        })
      ),
      new webpack.optimize.CommonsChunkPlugin({
        // Combines any node module libraries used into their own file
        name: 'js/pl-vendor-libraries',
        chunks: ['js/pl-source'],
        minChunks: module => {
          return module.context && /node_modules/.test(module.context);
        }
      }),
      new EventHooksPlugin({
        'after-compile': function (compilation, callback) {
          patternlab.buildFrontEnd(
            {
              cleanPublic,
              //watch: bool,
              //data: object
            },
            patternlab
          )

          // signal done and continue with build
          callback();
        }
      }),
    ]),
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: resolve('node_modules'),
          use: [{
            loader: 'babel-loader',
            options: {
              presets: [
                ['es2015', { modules: false }]
              ]
            }
          }]
        }
      ]
    },
    // set up watch with specific options for dev only, in place of devServer, whose duties will now be handled by patternlab-node
    watch: ifDev(true),
    watchOptions: {
      ignored: [
        /node_modules/,
        `source/**/*.!(${assetsToWatch})`
      ]
    }
  }, customization(env))

  return config
}
