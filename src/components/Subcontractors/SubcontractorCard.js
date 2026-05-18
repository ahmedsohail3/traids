/**
 * SubcontractorCard — compact card for a single subcontractor in the list.
 *
 * Props:
 *   name        string
 *   trade       string
 *   rating      number
 *   reviews     number
 *   distance    string   e.g. "2.5 mi"
 *   about       string
 *   hourlyRate  string   e.g. "£12/hr"
 *   avatarUri   string
 *   onViewProfile function
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { MapPin, Star } from 'lucide-react-native';
import { Text, Button } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const SubcontractorCard = ({ fullName, primaryTrade, totalRatings, yearsOfExperience, distance,cityLocation, professionalBio, hourlyRate, profileImage, onViewProfile }) => {
  return (
    <View style={styles.card}>
      {/* Top row: avatar + info */}
      <View style={styles.topRow}>
        <Image
          source={profileImage ? { uri: profileImage } : { uri: `https://i.pravatar.cc/150?u=${fullName}` }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.trade}>{primaryTrade}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
            <View style={styles.ratingWrap}>
              <Star size={RFValue(10)} color="#B45309" fill="#B45309" />
              <Text style={styles.ratingText}>{totalRatings}</Text>
              <Text style={styles.reviewsText}>(Exp: {yearsOfExperience})</Text>
            </View>
            <View style={styles.distanceWrap}>
              <MapPin size={RFValue(10)} color="#94A3B8" />
              <Text style={styles.distanceText}>{distance || cityLocation || "Distance not available"}</Text>
            </View>
          </View>

      {/* About */}
      {professionalBio && <>
      <Text style={styles.aboutLabel}>About</Text>
      <Text style={styles.aboutText} numberOfLines={3}>{professionalBio}</Text>
      </>}

      {/* Footer: hourly rate + view profile */}
      <View style={styles.footer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginVertical: 10}}>
          <Text style={styles.rateLabel}>HOURLY RATE</Text>
          <Text style={styles.rate}>{hourlyRate}</Text>
        </View>
        <Button
          title="View Profile"
          variant="secondary"
          onPress={onViewProfile}
          style={styles.profileBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: RFValue(42),
    height: RFValue(42),
    borderRadius: RFValue(21),
    backgroundColor: '#F1F5F9',
  },
  info: { flex: 1 },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: '#10375C',
    marginBottom: 2,
  },
  trade: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFFBEB', paddingHorizontal: 5, borderRadius: 4 },
  ratingText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(10), color: '#B45309' },
  reviewsText: { fontFamily: FontFamily.regular, fontSize: RFValue(9), color: '#B4530999' },
  distanceWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  distanceText: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#94A3B8' },
  aboutLabel: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(10),
    color: '#10375C',
    marginBottom: 4,
  },
  aboutText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
    lineHeight: RFValue(15),
    marginBottom: 12,
  },
  footer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderTopWidth: 1,
    // borderTopColor: '#F1F5F9',
  },
  rateLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(9),
    color: '#94A3B8',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  rate: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
  },
  profileBtn: {
    // width: RFValue(110),
    height: RFValue(35),
    minHeight: RFValue(20),
  },
});

export default SubcontractorCard;
