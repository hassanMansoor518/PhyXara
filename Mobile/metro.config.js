const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");
const arModelsDir = path.resolve(workspaceRoot, "AR_MODE", "Assets", "Model");

const config = getDefaultConfig(projectRoot);

if (process.platform === "win32") {
  // Metro traverses the graph concurrently, even when transform workers are limited.
  // Bound its cache I/O so a warm bundle cannot exhaust Windows file handles.
  const maxCacheOperations = 16;
  const waiting = [];
  let active = 0;

  async function limitCacheIO(operation) {
    if (active < maxCacheOperations) {
      active++;
    } else {
      await new Promise((resolve) => waiting.push(resolve));
    }

    try {
      return await operation();
    } finally {
      const next = waiting.shift();
      if (next) next();
      else active--;
    }
  }

  config.cacheStores = config.cacheStores.map((store) => ({
    get: (key) => limitCacheIO(() => store.get(key)),
    set: (key, value) => limitCacheIO(() => store.set(key, value)),
    clear: () => store.clear(),
  }));
}

// 1. Asset Extensions: Enable Metro to resolve .glb, .gltf, .bin, and .png files
const defaultAssetExts = config.resolver.assetExts || [];
const customAssetExts = ["glb", "gltf", "bin", "png"];
config.resolver.assetExts = Array.from(new Set([...defaultAssetExts, ...customAssetExts]));

// 2. Source Extensions: Ensure 3D binary files are treated strictly as static assets
config.resolver.sourceExts = (config.resolver.sourceExts || []).filter(
  (ext) => !["glb", "gltf", "bin"].includes(ext)
);

// 3. Watch Folders: Allow Metro to watch external 3D models if present
const extraWatchFolders = [
  path.resolve(workspaceRoot, "AR_MODE"),
  arModelsDir,
].filter((dir) => fs.existsSync(dir));

config.watchFolders = Array.from(
  new Set([
    ...(config.watchFolders || []),
    ...extraWatchFolders,
  ])
);

// 4. Node Modules: Guarantee proper module resolution from the Mobile root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./global.css" });
