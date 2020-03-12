const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const publicPath = '';
const pages = require('./webpack.pages').map((page) => page.path);

const apiFallbackOptions = (pagesTitles) => {
  return pagesTitles.map((title) => ({
    from: new RegExp(`^/${title}$`),
    to: `/${title}.html`
  }));
};

exports.publicPath = publicPath;

exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    disableHostCheck: true,
    contentBase: './src',
    watchOptions: {
      ignored: /node_modules/
    },
    publicPath,
    historyApiFallback: {
      rewrites: [{
        from: /^\/$/,
        to: `/main.html`
      }, ...apiFallbackOptions(pages)]
    },
    host, // Defaults to `localhost`
    port, // Defaults to 8080
    overlay: {
      errors: true,
      warnings: false
    }
  }
});

exports.loadPug = (options) => ({
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              interpolate: true,
              attrs: ['srcset']
            }
          },
          {
            loader: 'pug-html-loader',
            options
          }
        ]
      }
    ]
  }
});

exports.lintJS = ({ include, exclude, options }) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,
        enforce: 'pre',
        loader: 'eslint-loader',
        options
      }
    ]
  }
});

const sharedCSSLoaders = [
  {
    loader: 'css-loader',
    options: {
      importLoaders: 1
    }
  }
];

exports.autoprefix = () => ({
  loader: 'postcss-loader',
  options: {
    plugins: () => [require('autoprefixer')]
  }
});

exports.minifyCSS = ({ options }) => ({
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: options,
        canPrint: true // false for analyzer
      })
    ]
  }
});

exports.loadCSS = ({ include, exclude, use } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,

        include,
        exclude,

        use: [
          {
            loader: 'style-loader'
          },
          ...sharedCSSLoaders.concat(use)
        ]
      }
    ]
  }
});

exports.extractCSS = ({ include, exclude, options, use = [] } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,

        include,
        exclude,

        use: [
          { loader: MiniCssExtractPlugin.loader, options: { publicPath: '../' } },
          ...sharedCSSLoaders, ...use]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(options)
  ]
});

exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /^(?!icon).*\.(png|jpg|svg|webp)$/,
        include,
        exclude,
        use: {
          loader: 'file-loader',
          options
        }
      }]
  }
});

exports.loadFonts = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(eot|ttf|otf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,

        include,
        exclude,

        use: {
          loader: 'file-loader',
          options
        }
      }
    ]
  }
});

exports.loadJS = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.js$/,

        include,
        exclude,

        loader: 'babel-loader',
        options
      }
    ]
  }
});

exports.minifyJS = options => ({
  optimization: {
    minimizer: [
      new TerserPlugin(options)
    ]
  }
});

exports.page = ({
  path = '',
  template = require.resolve(
    'html-webpack-plugin/default_index.ejs'
  ),
  title
} = {}) => ({
  plugins: [
    new HtmlWebpackPlugin({
      filename: `${path && path}.html`,
      template,
      title
    })
  ]
});
