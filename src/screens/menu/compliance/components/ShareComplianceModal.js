import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button, TextInput } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { Folder } from 'lucide-react-native';

const ShareComplianceModal = ({ visible, onClose }) => {
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

              <View style={styles.header}>
                <View style={styles.iconWrap}>
                  <Folder size={16} color="#FFFFFF" fill="#10375C" strokeWidth={1} style={{ color: '#10375C' }}/>
                </View>
                <Text style={styles.title}>Share Project Compliance</Text>
              </View>

              <View style={styles.formGroup}>
                 <TextInput 
                  label="Enter Site's Manager Email"
                  placeholder="Enter email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                 />
              </View>

              <Button 
                title="Share" 
                variant="primary" 
                style={styles.shareBtn} 
                onPress={onClose} 
              />
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
    paddingBottom: 40,
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
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#10375C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(13),
    color: '#10375C',
  },
  formGroup: {
    marginBottom: 24,
  },
  shareBtn: {
    width: '100%',
  },
});

export default ShareComplianceModal;
