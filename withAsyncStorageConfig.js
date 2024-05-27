const { withProjectBuildGradle, withGradleProperties, createRunOncePlugin } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');
const pkg = require('@react-native-async-storage/async-storage/package.json');

const addKotlinGradlePlugin = (src) => {
  return mergeContents({
    tag: 'react-native-async-storage withNextStorage config plugin',
    src,
    newSrc: 'classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion"',
    anchor: /dependencies\s*\{/,
    offset: 1,
    comment: '//',
  });
};

const withDangerousMod = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const result = addKotlinGradlePlugin(config.modResults.contents);
      config.modResults.contents = result.contents;
    } else {
      throw new Error('Cannot add Kotlin Gradle plugin because the project build.gradle is not in Groovy');
    }
    return config;
  });
};

const withGradlePropertyMod = (config) => {
  return withGradleProperties(config, (config) => {
    const properties = [
      {
        type: 'property',
        key: 'AsyncStorage_useNextStorage',
        value: 'true',
      },
      {
        type: 'property',
        key: 'AsyncStorage_db_size_in_MB',
        value: '256',
      },
    ];

    properties.forEach((property) => {
      const exists = config.modResults.some(
        (item) => item.key === property.key && item.value === property.value
      );

      if (exists) {
      } else {
        config.modResults.push(property);
      }
    });

    return config;
  });
};

const withNextStorage = (config) => {
  const modifiedConfig = withGradlePropertyMod(withDangerousMod(config));
  return modifiedConfig;
};

module.exports = createRunOncePlugin(withNextStorage, pkg.name, pkg.version);
