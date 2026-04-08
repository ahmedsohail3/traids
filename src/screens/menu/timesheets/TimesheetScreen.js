import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';
import { FileSearch } from 'lucide-react-native';

const DATA = [
  { id: 1, title: 'Downtown Office Renovation', jobNum: 'Job#1', hours: 30, unbilled: '1,240' },
  { id: 2, title: 'Dusting surfaces', jobNum: 'Job#2', hours: 30, unbilled: '1,240' },
  { id: 3, title: 'Windexing mirrors', jobNum: 'Job#3', hours: 30, unbilled: '1,240' },
  { id: 4, title: 'Assisting with recordkeeping', jobNum: 'Job#4', hours: 30, unbilled: '1,240' },
  { id: 5, title: 'Maintaining food safety', jobNum: 'Job#5', hours: 30, unbilled: '1,240' },
  { id: 6, title: 'Vacuuming and / or mopping floors', jobNum: 'Job#6', hours: 30, unbilled: '1,240' },
];

const TimesheetScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="Timesheets"
        subtitle="Review work logs and generate professional projects invoices."
        showBackButton
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {DATA.map((item, idx) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TimesheetProject', { projectTitle: item.title })}
          >
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}>
                <FileSearch size={RFValue(18)} color="#10375C" />
              </View>
              <View style={styles.titleWrap}>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.jobText}>{item.jobNum}</Text>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <View style={styles.metricBlockBox}>
                <Text style={styles.metricLabel}>Hours</Text>
                <Text style={styles.metricValue}>{item.hours} Hours</Text>
              </View>
              <View style={styles.metricBlockBox}>
                <Text style={styles.metricLabel}>Unbilled</Text>
                <Text style={styles.metricValue}>{item.unbilled}</Text>
              </View>
            </View>

          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1 },
  titleText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11.5),
    marginBottom: 2,
  },
  jobText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9.5),
    color: '#64748B',
  },
  cardBottom: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBlockBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metricLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(11.5),
    color: '#64748B',
  },
});

export default TimesheetScreen;
