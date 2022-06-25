const getFirefoxExtensionVersion = () => {
    const manifest = browser.runtime.getManifest();

    return manifest.version
};

exportFunction(getFirefoxExtensionVersion, window, { defineAs: 'getFirefoxExtensionVersion' });
