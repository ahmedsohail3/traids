import { useRef } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const NAVY = '#10375C';
const SLATE = '#94A3B8';

const TabsHeader = ({ activeTab, onTabSelect, tabs = [] }) => {
  const scrollRef = useRef(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>
      
      <View style={styles.scrollWrapper}>
        <ScrollView 
          ref={scrollRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => onTabSelect(tab.id)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
        {/* Full width bottom border representing inactive track */}
        <View style={styles.trackBorder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0, 
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: NAVY,
    marginBottom: 16,
  },
  scrollWrapper: {
    position: 'relative',
  },
  scrollContent: {
    paddingRight: 20,
    flexDirection: 'row',
    gap: 20,
  },
  tabItem: {
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    zIndex: 2,
  },
  tabItemActive: {
    borderBottomColor: NAVY,
  },
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: SLATE,
  },
  tabTextActive: {
    color: NAVY,
    fontFamily: FontFamily.medium,
  },
  trackBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E2E8F0',
    zIndex: 1, // behind the active tab border
  }
});

export default TabsHeader;
