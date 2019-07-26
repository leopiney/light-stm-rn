const defaultAssetExts = require("metro-config/src/defaults/defaults")
  .assetExts;

module.exports = {
  resolver: {
    assetExts: [
      ...defaultAssetExts,
      // sqlite format
      "db"
    ]
  }
};
