import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '~context/ThemeContext';
import Header from '~components/Header';
import { ScrollView } from '~components/Common';
import { useSelector } from 'react-redux';

import CompanySettingsScreen from './company/CompanySettingsScreen';
import SubcontractorSettingsScreen from './subcontractor/SubcontractorSettingsScreen';

const SettingsScreen = () => {
  const { colors } = useTheme();
  const userType = useSelector((s) => s.auth?.user?.type ?? 'subcontractor');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Settings"
        subtitle="Manage your account settings and preferences."
        showBackButton
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {userType === 'company' ? <CompanySettingsScreen /> : <SubcontractorSettingsScreen />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root:            { flex: 1 },
  scrollContainer: { padding: 16, paddingBottom: 120 },
});

export default SettingsScreen;
