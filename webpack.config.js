/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtReloader = require('webpack-ext-reloader');
require('dotenv').config();

const targetBrowser = process.env.TARGET_BROWSER;

const sourcePath = path.join(__dirname, 'src');
const destPath = path.join(__dirname, 'extension');

const manifest = require('./src/manifest.json');
const MANIFEST_VERSION = String(
  manifest.manifest_version || manifest[`__${targetBrowser}__manifest_version`] || 3,
);

class RemoveManifestEntriesPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('remove-manifest-entries-plugin', (compilation) => {
      compilation.hooks.chunkAsset.tap('remove-manifest-entries-plugin', (chunk, file) => {
        if (!file.endsWith('.js') || compilation.chunkGraph.getNumberOfEntryModules(chunk) === 0) {
          return;
        }
        const modules = compilation.chunkGraph.getChunkEntryModulesIterable(chunk);
        // eslint-disable-next-line no-restricted-syntax
        for (const module of modules) {
          const isManifest = /manifest\.json$/.test(module.resource);
          if (isManifest) {
            chunk.files.forEach((f) => {
              if (f !== file) {
                chunk.files.delete(f);
              }
            });
            delete compilation.assets[file];
            console.log(`remove-manifest-entries-plugin: removed ${file}`);
          }
        }
      });
    });
  }
}

const extensionReloaderPlugin = new ExtReloader({
  port: targetBrowser === 'chrome' ? 9090 : 9091,
  reloadPage: true,
  entries: {
    contentScript: ['contentScript'],
    background: 'background',
  },
});

const fileExtensions = [
  '.mjs',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.json',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.eot',
  '.otf',
  '.svg',
  '.ttf',
  '.woff',
  '.woff2',
];

const background = path.join(sourcePath, 'Background');
const contentScript = path.join(sourcePath, 'ContentScript');

const alias = {
  Background: path.resolve(background),
  ContentScript: path.resolve(contentScript),
};

module.exports = {
  devtool: 'source-map',

  stats: {
    all: false,
    builtAt: true,
    errors: true,
    hash: true,
  },

  mode: 'development',

  entry: {
    manifest: path.join(sourcePath, 'manifest.json'),
    background: path.join(background, 'index.ts'),
    contentScript: path.join(contentScript, 'index.tsx'),
  },

  output: {
    path: path.join(destPath, targetBrowser),
    filename: 'js/[name].bundle.js',
  },

  resolve: {
    extensions: fileExtensions,
    alias,
    fallback: {
      fs: false,
      http: false,
      https: false,
      url: false,
    },
  },

  module: {
    rules: [
      {
        type: 'javascript/auto', // prevent webpack handling json with its own loaders,
        test: /\manifest\.json$/,
        use: {
          loader: 'wext-manifest-loader',
          options: {
            usePackageJSONVersion: true, // set to false to not use package.json version for manifest
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
        },
      },
    ],
  },

  plugins: [
    // Plugin to not generate js bundle for manifest entry
    new RemoveManifestEntriesPlugin(),
    // Generate sourcemaps
    new webpack.SourceMapDevToolPlugin({ filename: false }),
    // environmental variables
    new webpack.DefinePlugin({
      MANIFEST_VERSION: JSON.stringify(MANIFEST_VERSION),
    }),
    // dev mode
    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
    // delete previous build files
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(process.cwd(), `extension/${targetBrowser}`),
      ],
      cleanStaleWebpackAssets: false,
      verbose: true,
    }),
    // copy static assets
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets', to: 'assets' },
      ],
    }),
    // plugin to enable browser reloading in development mode
    extensionReloaderPlugin,
  ].filter(Boolean),
};
