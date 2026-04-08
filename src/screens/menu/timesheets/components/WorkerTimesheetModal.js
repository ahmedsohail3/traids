import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Image, ScrollView, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text} from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { ChevronDown, Clock } from 'lucide-react-native';
import { useTheme } from '~context/ThemeContext';

const MOCK_DATA = [
  { day: 'Monday', hours: '8 hours', date: 'Oct 24, 2023', checkedIn: '30 Hours', checkedOut: '08:00 AM', pill: '8 hrs' },
  { day: 'Tuesday', hours: '8 hours', date: 'Oct 24, 2023', checkedIn: '30 Hours', checkedOut: '08:00 AM', pill: '8 hrs' },
  { day: 'Wednesday', hours: '8 hours', date: 'Oct 24, 2023', checkedIn: '30 Hours', checkedOut: '08:00 AM', pill: '8 hrs' },
];

const WorkerTimesheetModal = ({ visible, onClose, worker }) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheet}>
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Image source={{ uri: `https://i.pravatar.cc/150?u=${worker?.id || 1}` }} style={styles.avatar} />
                  <View>
                    <Text style={styles.title}>Timesheet</Text>
                    <Text style={styles.subtitle}>{worker?.name || 'John Smith'}'s Timesheet</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.dropdownWrap}>
                  <Text style={styles.dropdownText}>Week 1</Text>
                  <ChevronDown size={RFValue(12)} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Scrollable list */}
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
                {MOCK_DATA.map((item, idx) => (
                  <View key={idx} style={styles.dayCard}>
                    {/* Top row */}
                    <View style={styles.dayHeader}>
                      <View>
                        <View style={styles.dayTitleRow}>
                          <Text style={styles.dayName}>{item.day}</Text>
                          <Text style={styles.dayHours}>{item.hours}</Text>
                        </View>
                        <Text style={styles.dayDate}>{item.date}</Text>
                      </View>
                      <View style={[styles.greenPill, {backgroundColor: colors.success}]}>
                        <Text style={styles.greenPillText}>{item.pill}</Text>
                      </View>
                    </View>

                    {/* Cards */}
                    <View style={styles.checkinRow}>
                      <View style={styles.checkinBox}>
                        <Text style={styles.checkinTitle}>Checked In</Text>
                        <View style={styles.checkinValRow}>
                          <Text style={styles.checkinVal}>{item.checkedIn}</Text>
                          <Clock size={RFValue(10)} color="#10375C" strokeWidth={2.5} />
                        </View>
                      </View>
                      <View style={styles.checkinBox}>
                        <Text style={styles.checkinTitle}>Checked Out</Text>
                        <View style={styles.checkinValRow}>
                          <Text style={styles.checkinVal}>{item.checkedOut}</Text>
                          <Clock size={RFValue(10)} color="#10375C" strokeWidth={2.5} />
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 23, 23, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 0,
    maxHeight: '70%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#F1F5F9',
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(13),
    color: '#10375C',
  },
  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
    color: '#64748B',
  },
  dropdownWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FCFDFD'
  },
  dropdownText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10.5),
    color: '#94A3B8',
  },
  listContainer: {
    paddingBottom: 20,
    gap: 16,
  },
  dayCard: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  dayName: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#10375C',
  },
  dayHours: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#94A3B8',
  },
  dayDate: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(9.5),
    color: '#94A3B8',
  },
  greenPill: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 16,
  },
  greenPillText: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(8.5),
    color: '#FFFFFF',
  },
  checkinRow: {
    flexDirection: 'row',
    gap: 10,
  },
  checkinBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  checkinTitle: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#64748B',
    marginBottom: 6,
  },
  checkinValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkinVal: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11.5),
    color: '#10375C',
  },
});

export default WorkerTimesheetModal;
