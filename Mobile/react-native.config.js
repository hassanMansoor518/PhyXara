// Viro and Unity both bundle the ARCore client (com.google.ar.core), which breaks the Android manifest/dex merge.
// Nothing in the app imports Viro, so keep it out of the native Android build. Remove this entry (and re-add the
// "@reactvision/react-viro" config plugin) if Viro is used again, then drop Unity's or Viro's arcore_client.
module.exports = {
  dependencies: {
    '@reactvision/react-viro': { platforms: { android: null } },
  },
};
