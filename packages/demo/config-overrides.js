
const WorkerPlugin = require('worker-plugin');

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.plugins = [
    ...config.plugins,
    new WorkerPlugin({
      sharedWorker: true,
    }),
  ];
  return config;
}
