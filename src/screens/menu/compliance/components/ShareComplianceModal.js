import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Text, Button, TextInput } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { Folder } from 'lucide-react-native';
import useAlert from '~hooks/useAlert';

const ShareComplianceModal = ({ visible, onClose, complianceId, onShare, sharing }) => {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setEmailError('Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleShare = () => {
    if (!validate() || !complianceId || sharing) return;

    onShare({ complianceId, email: email.trim() })
      .unwrap()
      .then(() => {
        showAlert({ title: 'Shared', message: `Compliance shared with ${email.trim()}.`, type: 'success' });
        setEmail('');
        onClose();
      })
      .catch((err) => {
        showAlert({
          title:   'Share Failed',
          message: typeof err === 'string' ? err : 'Failed to share compliance. Please try again.',
          type:    'error',
        });
      });
  };

  const handleClose = () => {
    if (sharing) return;
    setEmail('');
    setEmailError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheet}>
              <View style={styles.handleBar} />

              <View style={styles.header}>
                <View style={styles.iconWrap}>
                  <Folder size={16} color="#FFFFFF" fill="#10375C" strokeWidth={1} />
                </View>
                <Text style={styles.title}>Share Project Compliance</Text>
              </View>

              <View style={styles.formGroup}>
                <TextInput
                  label="Site Manager Email"
                  placeholder="Enter email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(''); }}
                  error={emailError}
                />
              </View>

              <Button
                title={sharing ? 'Sharing…' : 'Share'}
                variant="primary"
                style={styles.shareBtn}
                onPress={handleShare}
                disabled={sharing}
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
