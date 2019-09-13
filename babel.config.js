module.exports = {
  presets: ["@babel/preset-env"],
  env: {
    development: {
      ignore: ["**/*.test.js"],
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "10.15"
            }
          }
        ]
      ],
      plugins: []
    },
    browser: {
      ignore: ["**/*.test.js"],
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              browsers: "last 2 versions, ie 11"
            },
            modules: false
          }
        ]
      ],
      plugins: []
    },
    module: {
      ignore: ["**/*.test.js"],
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "10.15"
            },
            modules: false
          }
        ]
      ],
      plugins: []
    }
  },
  sourceMaps: true
};
