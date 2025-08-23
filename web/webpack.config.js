const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const share = mf.share;
const Dotenv = require('dotenv-webpack');

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, 'tsconfig.json'),
  [/* mapped paths to share */]);

module.exports = {
  output: {
    uniqueName: "au",
    publicPath: "auto",
    scriptType: 'text/javascript'
  },
  optimization: {
    runtimeChunk: false
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    }
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "au",
      filename: "remoteEntry2.js",
      exposes: {
        './AuthModule': './src/app/auth/auth.module.ts',
        './Component': './src/app/auth/auth.component.ts',
        // './UserSelectorComponent': './src/app/auth/components/_remotes/user-selector/user-selector.component.ts',

      },
      shared: share({
        "@angular/core": { singleton: true, strictVersion: true, requiredVersion: '17.0.5', eager: true },
        "@angular/common": { singleton: true, strictVersion: true, requiredVersion: '17.0.5', eager: true },
        // "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto', eager: true  },
        "@angular/router": { singleton: true, strictVersion: true, requiredVersion: '17.0.5', eager: true },
        "typlib": { singleton: true, strictVersion: true, requiredVersion: 'auto', eager: true },
        ...sharedMappings.getDescriptors(),
      })
    }),
    sharedMappings.getPlugin(),
    new Dotenv({
      path: './.env', // Path to .env file (this is the default)
    })
  ],
};
