/**
 * CompanyJobDetailScreen
 *
 * Full-screen job details view for Company role. Contains job details and a list of applicant bids.
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, ScrollView } from '~components/Common';
import Header from '~components/Header';
import { useTheme } from '~context/ThemeContext';
import { FontFamily } from '~theme/fonts';
import ApplicantCard from '~components/Job/ApplicantCard';

// ─── Mock Data ─────────────────────────────────────────────────────────────
const MOCK_APPLICANT = {
  name: 'Michael Chen',
  trade: 'Electrician',
  rate: '£12/hr',
  message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni',
  avatarUri: 'https://i.pravatar.cc/150?u=michael',
  isVerified: true,
};

const JobDetailScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  
  // Accept status from route or default to pending
  const jobStatus = route?.params?.status || 'Pending'; // 'Pending' or 'In Progress' for screenshots
  
  const isAccepted = jobStatus === 'In Progress' || jobStatus === 'Accepted';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header
        title="My Jobs"
        subtitle="Manage your active listings and ongoing projects."
        showBackButton
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Job Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.tagsRow}>
            {isAccepted ? (
              <View style={[styles.tag, { backgroundColor: '#1E3A8A' }]}>
                <Text style={styles.tagText}>In Progress</Text>
              </View>
            ) : (
              <View style={[styles.tag, { backgroundColor: '#F2A154' }]}>
                <Text style={styles.tagText}>Pending</Text>
              </View>
            )}
            <View style={[styles.tag, styles.completeBtn]}>
              <Text style={styles.completeBtnText}>✓ Complete Job</Text>
            </View>
          </View>

          <Text style={styles.jobTitle}>Westside Apartment Complex</Text>
          <Text style={styles.jobMeta}>Plumber • 123 Market St, Downtown</Text>

          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.descriptionText}>
            We are looking for a skilled and reliable plumber to join our team. The ideal candidate will be responsible for installing, repairing, and maintaining plumbing systems in residential, commercial, and industrial settings.
            {'\n'}
            {'\n'}Key Responsibilities:
            {'\n'}• Install and repair pipes, fittings, and fixtures of heating, water, and drainage systems.
            {'\n'}• Inspect plumbing systems to identify and troubleshoot issues.
            {'\n'}• Respond to emergency plumbing situations promptly.
            {'\n'}• Ensure all work complies with local plumbing codes and safety standards.
            {'\n'}• Maintain accurate records of work performed and materials used.
            {'\n'}
            {'\n'}Requirements:
            {'\n'}• Proven experience as a plumber.
            {'\n'}• Good understanding of plumbing systems and tools.
            {'\n'}• Ability to read technical drawings and blueprints.
            {'\n'}• Physical stamina and dexterity.
            {'\n'}• Strong problem-solving skills.
            {'\n'}• Certification or vocational training in plumbing is preferred.
            {'\n'}
            {'\n'}Benefits:
            {'\n'}• Competitive salary
            {'\n'}• Health and safety support
            {'\n'}• Opportunities for skill development
          </Text>
        </View>

        {/* Applicants List */}
        <ApplicantCard 
          {...MOCK_APPLICANT}
          status={isAccepted ? 'accepted' : 'pending'}
          onCancel={() => {}}
          onAccept={() => {}}
          onMessage={() => {}}
        />

        {/* Duplicate card to match mockup which shows two */}
        <ApplicantCard 
          {...MOCK_APPLICANT}
          status={isAccepted ? 'accepted' : 'pending'}
          onCancel={() => {}}
          onAccept={() => {}}
          onMessage={() => {}}
        />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
  },
  completeBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#64748B',
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(10),
  },
  jobTitle: {
    color: '#10375C',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(14),
    marginBottom: 4,
  },
  jobMeta: {
    color: '#64748B',
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#10375C',
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    marginBottom: 10,
  },
  descriptionText: {
    color: '#64748B',
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    lineHeight: RFValue(16),
  },
});

export default JobDetailScreen;
