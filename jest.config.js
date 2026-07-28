module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // These ship untranspiled ESM, so they have to go through babel.
  // Note the trailing `.*` — without it the pattern only matches exact package
  // names and misses the whole react-native-* family.
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native.*|react-native.*|@react-navigation.*|@stripe.*|@reduxjs.*|react-redux|redux|redux-persist|redux-thunk|immer|reselect|lucide-react-native|axios)/)',
  ],
};
