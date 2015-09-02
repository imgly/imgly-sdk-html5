var path = require('path')
var WebpackNotifierPlugin = require('webpack-notifier')

var destination = 'build'
var source = 'src'
var env = process.env.ENV || 'development'

module.exports = {
  // Global environment. Tasks watch for changes in development only
  env: env,

  // The public assets folder
  destination: destination,

  serverPort: 8080,

  // node-sass / libsass configuration
  sass: {
    src: [
      source + '/css/imglykit-night-ui.sass',
      source + '/css/imglykit-night-react-ui.sass'
    ],
    allSrc: [
      source + '/**/*.sass'
    ],
    dest: destination + '/css',
    destFiles: [
      destination + '/css/imglykit-night-ui.css',
      destination + '/css/imglykit-night-react-ui.css'
    ],
    settings: {
      indentedSyntax: true,
      sourceComments: env === 'development',
      includePaths: [
        'node_modules/compass-mixins/lib'
      ]
    }
  },

  // Source and destination paths for assets
  assets: {
    src: source + '/assets/**',
    dest: destination + '/assets'
  },

  // Source and destination paths for javascripts
  js: {
    src: source + '/js/*.js',
    // The files that should be checked by the `standard` linter
    standardSrc: [
      source + '/js/**/*.js',
      '!' + source + '/js/vendor/**/*.js'
    ],
    dest: destination + '/js/',
    destFile: destination + '/js/imglykit.js'
  },

  // Webpack configuration
  webpack: {
    watch: env === 'development',
    context: path.resolve(source + '/js'),
    output: {
      library: 'ImglyKit',
      libraryTarget: 'umd',
      filename: '[name].js',
      path: path.resolve(destination + '/js')
    },
    resolve: {
      extensions: ['', '.js', '.jsx'],
      root: path.resolve(source + '/js'),
      modulesDirectories: ['node_modules']
    },
    node: {
      fs: 'empty',
      path: 'empty'
    },
    entry: {
      imglykit: './imglykit'
    },
    devtool: 'inline-source-map',
    externals: [
      'canvas'
    ],
    module: {
      loaders: [
        {
          test: /\.json?$/,
          loader: 'json'
        },
        {
          test: /\.jsx?$/,
          include: /src\/js/,
          loaders: [
            path.resolve(__dirname, 'loaders', 'dotjs-loader'),
            'babel-loader?cacheDirectory&sourceMap'
          ]
        }
      ]
    },
    plugins: [
      new WebpackNotifierPlugin()
    ]
  }
}
