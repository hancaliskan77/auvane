const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const calc = path.resolve(__dirname, '../../packages/calc');

// Share the pure calculation package (TypeScript source) with the server.
config.watchFolders = [calc];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(calc, 'node_modules'),
];
config.resolver.extraNodeModules = { '@auvane/calc': path.resolve(calc, 'src') };
module.exports = config;
