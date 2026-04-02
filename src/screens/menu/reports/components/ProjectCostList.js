import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { RFValue } from 'react-native-responsive-fontsize';

const DATA = [
  { id: 1, name: 'Downtown Office Renovation', manager: 'Michael Chen', status: 'Active', budget: '£45,000', actual: '£28,400', actualWarning: false },
  { id: 2, name: 'Westside Apartment Complex', manager: 'Sarah Miller', status: 'Active', budget: '£12,000', actual: '£3,500', actualWarning: false },
  { id: 3, name: 'City Park Gazebo', manager: 'David Wilson', status: 'Completed', budget: '£8,500', actual: '£8,200', actualWarning: true },
  { id: 4, name: 'Lakeside Retail Fitout', manager: 'James Rodriguez', status: 'Delayed', budget: '£12,000', actual: '£3,500', actualWarning: false },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return '#10375C'; // Navy
    case 'Completed': return '#22C55E'; // Green
    case 'Delayed': return '#EF4444'; // Red
    default: return '#64748B';
  }
};

const ProjectCostList = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Project Cost Summary</Text>

      <View style={styles.list}>
        {DATA.map((item, index) => (
          <View 
            key={item.id} 
            style={[
              styles.itemRow, 
              index !== DATA.length - 1 && styles.borderBottom
            ]}
          >
            <View style={styles.topRow}>
              <View style={styles.nameBlock}>
                <Text style={styles.projectName}>{item.name}</Text>
                <Text style={styles.managerName}>{item.manager}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>
                Budget: {item.budget}
              </Text>
              <Text style={[
                styles.bottomText, 
                item.actualWarning && { color: '#EF4444', fontFamily: FontFamily.bold }
              ]}>
                Actual: <Text style={[styles.boldText, item.actualWarning && { color: '#EF4444' }]}>{item.actual}</Text>
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 20,
  },
  itemRow: {
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameBlock: {
    flex: 1,
    paddingRight: 10,
  },
  projectName: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(11),
    color: '#10375C',
    marginBottom: 2,
  },
  managerName: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#94A3B8',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    color: '#FFFFFF',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#64748B',
  },
  boldText: {
    fontFamily: FontFamily.bold,
    color: '#334155',
  },
});

export default ProjectCostList;
