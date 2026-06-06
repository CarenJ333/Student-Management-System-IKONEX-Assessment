module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  globalTeardown: '<rootDir>/jest.globalTeardown.js',
  verbose: true,
  clearMocks: true,
};
