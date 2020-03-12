const path = require('path');
const merge = require('webpack-merge');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const parts = require('./webpack.parts');
const pagesOptions = require('./webpack.pages');

const lintJSOptions = {
  emitWarning: true,
  failOnWarning: false,
  failOnError: false,
  quiet: true,
  fix: false,
  cache: true,
  formatter: require('eslint-friendly-formatter')
};

const pugOptions = {
  pretty: true // Depricated, use with cautions
};

const paths = getPaths({
  sourceDir: 'src',
  buildDir: 'docs',
  images: 'assets/img',
  js: 'js',
  fonts: 'assets/fonts',
  icons: 'assets/icons'
});

const pages = pagesOptions.map((options) => {
  return parts.page({
    title: options.title,
    path: options.path,
    template: path.join(paths.app, `templates/pages/${options.pathToFile}`)
  });
});

const lintStylesOptions = {
  context: path.resolve(__dirname, `${paths.app}/scss`),
  syntax: 'scss',
  emitErrors: false,
  fix: true
};

const cssPreprocessorLoader = { loader: 'fast-sass-loader' };

const commonConfig = merge([
  {
    context: paths.app,
    resolve: {
      unsafeCache: true,
      symlinks: false,
    },
    entry: `${paths.app}/index.js`,
    output: {
      path: paths.build,
      publicPath: parts.publicPath
    },
    devtool: process.env.NODE_ENV !== 'production' ? 'none' : 'source-map',
    plugins: [
      new FriendlyErrorsPlugin(),
      new StylelintPlugin(lintStylesOptions),
    ],
  },
  parts.loadPug(pugOptions),
  parts.lintJS({ include: paths.app, exclude: path.resolve(__dirname, 'src'), options: lintJSOptions }),
  parts.loadFonts({
    include: paths.app,
    options: {
      name: `${paths.fonts}/[name].[ext]`
    }
  }),
]);

const productionConfig = merge([
  {
    mode: 'production',
    output: {
      filename: `${paths.js}/[name].bundle.js`
    },
    performance: {
      hints: 'warning', // 'error' or false are valid too
      maxEntrypointSize: 100000, // in bytes
      maxAssetSize: 450000 // in bytes
    },
    plugins: [
      new CleanPlugin({
        cleanOnceBeforeBuildPatterns: ['js/main.bundle.js', '*.html']
      })
    ]
  },
  parts.minifyJS({
    terserOptions: {
      parse: {
        ecma: 8
      },
      compress: {
        ecma: 5,
        warnings: false,
        comparisons: false
      },
      mangle: {
        safari10: true
      },
      output: {
        ecma: 5,
        comments: false,
        ascii_only: true
      }
    },
    parallel: true,
    cache: true
  }),
  parts.loadJS(),
  parts.extractCSS({
    include: paths.app,
    use: [parts.autoprefix(), cssPreprocessorLoader],
    options: {
      filename: `${paths.css}/style.css`
    }
  }),
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true
      }
    }
  }),
  parts.loadImages({
    exclude: path.join(paths.app, paths.icons),
    options: {
      limit: 15000,
      name: `${paths.images}/[name].[ext]`
    }
  })
]);

const developmentConfig = merge([
  {
    mode: 'development'
  },
  parts.devServer({
    host: '0.0.0.0', // to access from mobile
    port: process.env.PORT || 80
  }),
  parts.loadCSS({ include: paths.app, use: [cssPreprocessorLoader] }),
  parts.loadImages({
    include: paths.app,
    exclude: path.join(paths.app, paths.icons)
  }),
  parts.loadJS()
]);

module.exports = env => {
  process.env.NODE_ENV = env;

  return merge(
    commonConfig,
    env === 'production' ? productionConfig : developmentConfig,
    ...pages
  );
};

function getPaths ({
  sourceDir = 'app',
  buildDir = 'build',
  staticDir = '',
  icons = 'icons',
  images = 'images',
  fonts = 'fonts',
  js = 'scripts',
  css = 'styles'
} = {}) {
  const assets = { images, fonts, js, css };

  return Object.keys(assets).reduce((obj, assetName) => {
    const assetPath = assets[assetName];

    obj[assetName] = !staticDir ? assetPath : `${staticDir}/${assetPath}`;

    return obj;
  }, {
    app: path.join(__dirname, sourceDir),
    build: path.join(__dirname, buildDir),
    staticDir,
    icons
  });
}
