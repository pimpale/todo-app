import {Configuration, ProvidePlugin} from 'webpack';

module.exports = {
  webpack: {
    configure: (config:Configuration) => {
      config.resolve!.fallback = {
        buffer: require.resolve('buffer'),
      };

      config.plugins!.push(
        new ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      );
      return config;
    }
  }
}
