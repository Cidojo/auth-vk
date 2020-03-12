module.exports = (api) => {
  const isProd = api.cache(() => process.env.NODE_ENV === 'production');

  return {
    plugins: [
      '@babel/plugin-transform-typeof-symbol',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-class-properties'
    ],
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          targets: {
            browsers: ['last 2 versions', 'ie >= 11']
          }
        }
      ]
    ],
    overrides: [{
      test: './node_modules/**/*',
      compact: true
    }]
  };
};
