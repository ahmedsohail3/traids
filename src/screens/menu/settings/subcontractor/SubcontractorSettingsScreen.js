import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import TabsHeader from '../components/TabsHeader';
import ProfileDetailsTab from './tabs/ProfileDetailsTab';
import AvailabilityTab from './tabs/AvailabilityTab';
import DocumentsTab from './tabs/DocumentsTab';
import SecurityTab from './tabs/SecurityTab';
import NotificationsTab from './tabs/NotificationsTab';

const TABS = [
  { id: 'profile', label: 'Profile Details' },
  { id: 'availability', label: 'Availability Schedule' },
  { id: 'documents', label: 'Documents' },
  { id: 'security', label: 'Account Security' },
  { id: 'notifications', label: 'Notifications' },
];

const SubcontractorSettingsScreen = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTabContent = () => {
    switch(activeTab) {
      case 'profile': return <ProfileDetailsTab />;
      case 'availability': return <AvailabilityTab />;
      case 'documents': return <DocumentsTab />;
      case 'security': return <SecurityTab />;
      case 'notifications': return <NotificationsTab />;
      default: return null;
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
  }
});

export default SubcontractorSettingsScreen;
