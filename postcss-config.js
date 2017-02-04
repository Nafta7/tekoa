module.exports = {
  use: [
    "postcss-easy-import",
    "postcss-nesting",
    "postcss-hsb-color",
    "postcss-css-variables",
    "postcss-responsive-font",
    "css-mqpacker",
    "postcss-custom-media"
  ],
  parser: "sugarss",
  "postcss-css-variables": {
    preserve: true
  },
  "postcss-easy-import": {
    extensions: ['.sss'],
    onImport: function(sources) {
      global.watchCSS(sources)
    }
  },
  "input": "app/styles/main.sss",
  "output": "build/main.css",
  "map": true
};
