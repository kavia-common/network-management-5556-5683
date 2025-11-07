module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/**/*.test.(js|jsx|ts|tsx)',
    '<rootDir>/tests/**/*.test.(js|jsx|ts|tsx)',
    '<rootDir>/tests/**/*.integration.test.(js|jsx|ts|tsx)',
  ],

  transformIgnorePatterns: [
    'node_modules/(?!(react-router|react-router-dom)/)',
  ],
};
