const webpack = require('webpack');

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        THREE: "three"
      })
    ]
  },
  pwa: {
    manifestOptions: {
      themeColor: '#ffffff',
      start_url: "./",
      scope: "/",
      display: "standalone",
      appleMobileWebAppCapable: "yes",
      appleMobileWebAppStatusBarStyle: "white",
      workboxPluginMode: "InjectManifest",
      workboxOptions: {
        navigateFallback: 'index.html',
        swSrc: 'public/service-worker.js',
      },
      prefer_related_applications: false,
      related_applications: []
    },
  }
}
