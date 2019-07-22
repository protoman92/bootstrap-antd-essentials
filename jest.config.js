module.exports = {
  roots: ["<rootDir>", "<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "src/*.*(test|spec)\\.(jsx?|tsx?)$",
  collectCoverage: true,
  modulePaths: ["src"],
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy"
  },
  setupFiles: ["<rootDir>/setupTests.js"]
};
