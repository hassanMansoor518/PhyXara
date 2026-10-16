const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");
const arModelsDir = path.resolve(workspaceRoot, "AR_MODE", "Assets", "Model");

const config = getDefaultConfig(projectRoot);

// 1. Asset Extensions: Enable Metro to resolve .glb, .gltf, .bin, and .png files
const defaultAssetExts = config.resolver.assetExts || [];
const customAssetExts = ["glb", "gltf", "bin", "png"];
config.resolver.assetExts = Array.from(new Set([...defaultAssetExts, ...customAssetExts]));

// 2. Source Extensions: Ensure 3D binary files are treated strictly as static assets
config.resolver.sourceExts = (config.resolver.sourceExts || []).filter(
  (ext) => !["glb", "gltf", "bin"].includes(ext)
);

// 3. Watch Folders: Allow Metro to watch and bundle 3D models located in AR_MODE
config.watchFolders = Array.from(
  new Set([
    ...(config.watchFolders || []),
    path.resolve(workspaceRoot, "AR_MODE"),
    arModelsDir,
  ])
);

// 4. Node Modules: Guarantee proper module resolution from the Mobile root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./global.css" });
