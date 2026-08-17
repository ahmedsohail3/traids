module.exports = {
    assets: ['./assets/fonts'],
    dependencies: {
        // Android-only: its iOS RNDatePickerManager is a plain RCTViewManager and
        // fails RN 0.84's RCTModuleProvider check. iOS uses @react-native-community/datetimepicker.
        'react-native-date-picker': {
            platforms: { ios: null },
        },
    },
};