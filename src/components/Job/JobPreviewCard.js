import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { MapPin, Calendar } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';

const NAVY = '#10375C';

const JobPreviewCard = ({ title, trade, rate, description }) => (
  <View style={styles.previewCard}>
    <View style={styles.previewTopRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.previewTitle}>{title || 'Job Title'}</Text>
        <Text style={styles.previewTrade}>{trade || 'Trade Type'}</Text>
      </View>
      <View style={styles.activeBadge}>
        <Text style={styles.activeBadgeText}>Active</Text>
      </View>
    </View>
    
    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <MapPin size={RFValue(12)} color="#94A3B8" />
        <Text style={styles.previewMeta}>Location not specified</Text>
      </View>
      <View style={styles.metaItem}>
        <Calendar size={RFValue(12)} color="#94A3B8" />
        <Text style={styles.previewMeta}>Start - End</Text>
      </View>
    </View>

    <View style={styles.rateRow}>
      <Text style={styles.previewRateAmount}>£ {rate || '0'}</Text>
      <Text style={styles.previewRateUnit}> / Hour</Text>
    </View>
    
    <Text style={styles.previewDesc} numberOfLines={3}>
      {description || 'Complete rewiring of the 2nd floor office space including new panel installation and testing.'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#F2A154',
    padding: RFValue(14),
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  previewTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  previewTitle: { fontFamily: FontFamily.bold, fontSize: RFValue(14), color: NAVY, marginBottom: 4 },
  previewTrade: { fontFamily: FontFamily.regular, fontSize: RFValue(11), color: '#64748B' },
  activeBadge: { 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    borderRadius: 20, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    marginLeft: 8 
  },
  
  activeBadgeText: { fontFamily: FontFamily.semiBold, fontSize: RFValue(10), color: '#64748B' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewMeta: { fontFamily: FontFamily.regular, fontSize: RFValue(11), color: '#94A3B8' },
  rateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  previewRateAmount: { fontFamily: FontFamily.bold, fontSize: RFValue(12), color: NAVY },
  previewRateUnit: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#94A3B8' },
  previewDesc: { fontFamily: FontFamily.regular, fontSize: RFValue(10), color: '#64748B', lineHeight: RFValue(15), fontStyle: 'italic', padding: 10, backgroundColor: '#F8FAFC', borderRadius: 8 },
});

export default JobPreviewCard;
