import React from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { CheckCircle2 } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { Images } from '~assets';

const NAVY = '#10375C';

const SuccessOverlay = ({ visible, onViewJobs }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalBg}>
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        
        <View style={styles.successIconWrap}>
          <Image source={Images.checkmarkIcon} style={styles.successIcon}/>
        </View>
        <Text style={styles.successTitle}>Job Posted Successfully</Text>
        <Text style={styles.successSub}>
          Your job has been created and is now visible to potential subcontractors.
        </Text>
        
        <TouchableOpacity style={styles.successBtn} onPress={onViewJobs} activeOpacity={0.85}>
          <Text style={styles.successBtnText}>See My Jobs</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(16,55,92,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 24,
  },
  successIconWrap: {
    width: RFValue(60),
    height: RFValue(60),
    borderRadius: RFValue(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    // borderWidth: 1.5,
    // borderStyle: 'dashed',
    // borderColor: '#22C55E',
  },
  successIcon: {
    width: RFValue(60),
    height: RFValue(60),
  },
  successTitle: { 
    fontFamily: FontFamily.bold, 
    fontSize: RFValue(16), 
    color: NAVY, 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  successSub: { 
    fontFamily: FontFamily.regular, 
    fontSize: RFValue(11), 
    color: '#64748B', 
    textAlign: 'center', 
    lineHeight: RFValue(17), 
    marginBottom: 28,
    paddingHorizontal: 16,
  },
  successBtn: {
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  successBtnText: { 
    fontFamily: FontFamily.bold, 
    fontSize: RFValue(13), 
    color: '#fff' 
  },
});

export default SuccessOverlay;
