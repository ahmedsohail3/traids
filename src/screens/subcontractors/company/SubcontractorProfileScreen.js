/**
 * SubcontractorProfileScreen
 *
 * Full-screen subcontractor profile for Company role.
 * Shows bio, compliance center, work history, and a "Book Now" / offer flow.
 */
import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Image, Linking,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  Star, MapPin, Download, CheckCircle2, XCircle,
  MessageSquare, Briefcase,
} from 'lucide-react-native';
import { Text, Button } from '~components/Common';
import Header from '~components/Header';
import { FontFamily } from '~theme/fonts';
import { useTheme } from '~context/ThemeContext';
import SendOfferModal from '~components/Subcontractors/SendOfferModal';

// ─── Mock data ────────────────────────────────────────────────────────────────
const COMPLIANCE = [
  { label: 'Public Liability Insurance', date: 'Nov 15, 2024', status: 'verified' },
  { label: 'Site Tickets', status: 'pending' },
  { label: 'Trade Certifications', date: 'Apr 15, 2024', status: 'expired' },
];

const WORK_HISTORY = [
  { title: 'Commercial Wiring - Downtown', date: 'Verified Job: May 10, 2023', rating: 5.0, review: 'Exceptional work on the Downtown office renovation. Fully professional and great attention to detail.', reviewer: 'John Smith' },
  { title: 'Emergency Pipe Repair', date: 'Verified Job: May 10, 2023', rating: 5.0, review: '"Solved a complex plumbing issue we had been struggling with for weeks. Highly recommended!"', reviewer: 'Alice Johnson' },
  { title: 'Residential Complex Phase 2', date: 'Verified Job: May 10, 2023', rating: 5.0, review: '"Good quality work, finished slightly behind schedule but communicated throughout the process."', reviewer: 'ConstructCorp JnB' },
];

// ─── Small helpers ────────────────────────────────────────────────────────────
const StatusIcon = ({ status }) => {
  if (status === 'verified') return <CheckCircle2 size={RFValue(14)} color="#22C55E" fill="#22C55E" strokeWidth={0} />;
  if (status === 'expired') return <XCircle size={RFValue(14)} color="#EF4444" fill="#EF4444" strokeWidth={0} />;
  return <CheckCircle2 size={RFValue(14)} color="#F2A154" fill="#F2A154" strokeWidth={0} />;
};

const StarRow = ({ rating }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={RFValue(10)} color="#F2A154" fill="#F2A154" />
    ))}
    <Text style={{ fontFamily: FontFamily.bold, fontSize: RFValue(11), color: '#F2A154', marginLeft: 4 }}>{rating.toFixed(1)}</Text>
  </View>
);

const ReviewerAvatar = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <View style={styles.reviewerAvatar}>
      <Text style={styles.reviewerInitial}>{initial}</Text>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const SubcontractorProfileScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const sub = route?.params?.sub ?? {
    name: 'Michael Chen', trade: 'Electrician', rating: 4.9, reviews: 154,
    distance: '2.5 mi', hourlyRate: '£12/hr',
    about: 'Highly skilled Electrician with over 8 years of experience in both residential and commercial projects. Specialising in energy efficient installations and rapid troubleshooting. Strictly adhering to safety regulations. I take pride in clear communication and ensuring the job site is always left clean and tidy.',
    avatarUri: 'https://i.pravatar.cc/150?u=michael',
  };

  const [offerVisible, setOfferVisible] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Find Subcontractors" subtitle="Discover and hire top-rated professionals for your project." showBackButton />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: sub.avatarUri }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{sub.name}</Text>
              <View style={styles.tradePill}>
                <Text style={styles.tradePillText}>{sub.trade}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Star size={RFValue(11)} color="#F2A154" fill="#F2A154" />
              <Text style={styles.rating}>{sub.rating}</Text>
              <Text style={styles.reviews}>{sub.reviews}k Reviews</Text>
              <Text style={styles.stat}>90% Success</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.rateLabel}>Hourly Rate</Text>
              <Text style={styles.rateValue}>{sub.hourlyRate}</Text>
            </View>
          </View>
        </View>

        {/* CTA buttons */}
        <View style={styles.ctaRow}>
          <Button
            title="Message"
            variant="outline"
            style={{ flex: 1 }}
            onPress={() => {}}
          />
          <Button
            title="Book Now"
            variant="primary"
            style={{ flex: 1, backgroundColor: '#F2A154' }}
            onPress={() => setOfferVisible(true)}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{sub.about}</Text>
        </View>

        {/* Compliance Center */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Center</Text>
          <Text style={styles.sectionSub}>Click to view / Certifications</Text>
          {COMPLIANCE.map((item, i) => (
            <View key={i} style={styles.complianceRow}>
              <StatusIcon status={item.status} />
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={styles.complianceLabel}>{item.label}</Text>
                {item.date && <Text style={styles.complianceDate}>{item.date}</Text>}
              </View>
              <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.7}>
                <Download size={RFValue(12)} color="#64748B" />
                <Text style={styles.downloadText}>Download Copy</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Work History */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Work History</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
          </View>
          {WORK_HISTORY.map((item, i) => (
            <View key={i} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyDate}>{item.date}</Text>
                </View>
                <StarRow rating={item.rating} />
              </View>
              <Text style={styles.historyReview}>{item.review}</Text>
              <View style={styles.reviewerRow}>
                <ReviewerAvatar name={item.reviewer} />
                <Text style={styles.historyReviewer}>Review by {item.reviewer}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <SendOfferModal
        visible={offerVisible}
        onClose={() => setOfferVisible(false)}
        onSent={() => navigation.navigate('Jobs')}
        subName={sub.name}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: RFValue(52),
    height: RFValue(52),
    borderRadius: RFValue(26),
    backgroundColor: '#F1F5F9',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontFamily: FontFamily.bold, fontSize: RFValue(14), color: '#10375C' },
  tradePill: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  tradePillText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(9), color: '#10375C' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  rating: { fontFamily: FontFamily.semiBold, fontSize: RFValue(11), color: '#10375C' },
  reviews: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#94A3B8' },
  dot: { color: '#CBD5E1', fontSize: RFValue(10) },
  stat: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#64748B' },
  rateLabel: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#94A3B8' },
  rateValue: { fontFamily: FontFamily.bold, fontSize: RFValue(11), color: '#10375C' },
  ctaRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: RFValue(12), color: '#10375C', marginBottom: 4 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionSub: { fontFamily: FontFamily.regular, fontSize: RFValue(9), color: '#94A3B8', marginBottom: 10 },
  viewAll: { fontFamily: FontFamily.semiBold, fontSize: RFValue(10), color: '#F2A154' },
  body: { fontFamily: FontFamily.regular, fontSize: RFValue(11), color: '#64748B', lineHeight: RFValue(17) },
  complianceRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 8,
    padding: 10, marginBottom: 8, backgroundColor: '#FAFAFA',
  },
  complianceLabel: { fontFamily: FontFamily.medium, fontSize: RFValue(11), color: '#1E293B' },
  complianceDate: { fontFamily: FontFamily.regular, fontSize: RFValue(9), color: '#94A3B8' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  downloadText: { fontFamily: FontFamily.regular, fontSize: RFValue(9), color: '#64748B' },
  historyCard: {
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 8,
    padding: 12, marginBottom: 8, backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  historyTitle: { fontFamily: FontFamily.bold, fontSize: RFValue(11), color: '#10375C', marginBottom: 2 },
  historyDate: { fontFamily: FontFamily.regular, fontSize: RFValue(9), color: '#94A3B8' },
  historyReview: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B', lineHeight: RFValue(15), marginBottom: 12 },
  reviewerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewerAvatar: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  reviewerInitial: { fontFamily: FontFamily.semiBold, fontSize: RFValue(9), color: '#64748B' },
  historyReviewer: { fontFamily: FontFamily.medium, fontSize: RFValue(10), color: '#64748B' },
});

export default SubcontractorProfileScreen;
