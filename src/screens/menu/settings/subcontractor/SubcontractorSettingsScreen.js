import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import TabsHeader from '../components/TabsHeader';
import ProfileDetailsTab from './tabs/ProfileDetailsTab';
import AvailabilityTab from './tabs/AvailabilityTab';
import DocumentsTab from './tabs/DocumentsTab';
import SecurityTab from './tabs/SecurityTab';
import NotificationsTab from './tabs/NotificationsTab';
import useProfile from '~hooks/useProfile';
import useSubcontractorProfile from '~hooks/useSubcontractorProfile';

const TABS = [
  { id: 'profile',       label: 'Profile Details' },
  { id: 'availability',  label: 'Availability Schedule' },
  { id: 'documents',     label: 'Documents' },
  { id: 'security',      label: 'Account Security' },
  { id: 'notifications', label: 'Notifications' },
];

const SubcontractorSettingsScreen = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const { profile } = useProfile();
  const { updateProfile, updatingProfile } = useSubcontractorProfile();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileDetailsTab
            profile={profile}
            updateProfile={updateProfile}
            updatingProfile={updatingProfile}
          />
        );
      case 'availability':
        return (
          <AvailabilityTab
            profile={profile}
            updateProfile={updateProfile}
            updatingProfile={updatingProfile}
          />
        );
      case 'documents':
        return (
          <DocumentsTab
            profile={profile}
            updateProfile={updateProfile}
            updatingProfile={updatingProfile}
          />
        );
      case 'security':
        return (
          <SecurityTab
            updateProfile={updateProfile}
            updatingProfile={updatingProfile}
          />
        );
      case 'notifications':
        return (
          <NotificationsTab
            profile={profile}
            updateProfile={updateProfile}
            updatingProfile={updatingProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TabsHeader activeTab={activeTab} onTabSelect={setActiveTab} tabs={TABS} />

      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 3,
    minHeight: 500,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 16,
  },
});

export default SubcontractorSettingsScreen;
