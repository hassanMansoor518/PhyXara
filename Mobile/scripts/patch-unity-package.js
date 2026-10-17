const fs = require('fs');
const path = require('path');

const unityGradle = path.join(__dirname, '..', 'node_modules', '@azesmway', 'react-native-unity', 'android', 'build.gradle');

if (fs.existsSync(unityGradle)) {
  let content = fs.readFileSync(unityGradle, 'utf8');
  if (content.includes('jcenter()')) {
    content = content.replace(/jcenter\(\)/g, '// jcenter() removed for Gradle 9 compatibility');
    fs.writeFileSync(unityGradle, content, 'utf8');
    console.log('[patch-unity-package] Successfully removed jcenter() from @azesmway/react-native-unity/android/build.gradle');
  } else {
    console.log('[patch-unity-package] jcenter() already absent from @azesmway/react-native-unity/android/build.gradle');
  }
} else {
  console.log('[patch-unity-package] @azesmway/react-native-unity build.gradle not found, skipping');
}
