/**
 * FilterTabs — Scrollable tab bar with badges.
 *
 * Props:
 *   tabs        Array    e.g. [{ key: 'all', label: 'All', count: 10 }, ...]
 *   activeTab   String   The key of the currently selected tab
 *   onChange    Function (tabKey) => void
 */
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const FilterTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => onChange(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {tab.count !== undefined && (
                <View style={[styles.badge, isActive && styles.badgeActive]}>
                  <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
    gap: 10,
  },
  tabItemActive: {
    backgroundColor: '#10375C',
    borderColor: '#10375C',
  },
  tabLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#DDDDDD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    color: '#64748B',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
});

export default FilterTabs;
