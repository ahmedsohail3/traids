/**
 * ViewProfileModal — shared bottom-sheet modal to view a contact's profile.
 * Used from within a chat conversation.
 */
import React from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback, Platform, Image } from 'react-native';
import { Text } from '~components/Common';
import { RFValue } from 'react-native-responsive-fontsize';
import { FontFamily } from '~theme/fonts';

const ViewProfileModal = ({ visible, onClose, profile }) => {
  if (!profile) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheet}>
              <View style={styles.handleBar} />

              {/* Profile header */}
              <View style={styles.profileHeader}>
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.profileAvatar} />
                ) : (
                  <View style={[styles.profileAvatar, styles.profileAvatarFallback]}>
                    <Text style={styles.profileAvatarIcon}>{profile.logoEmoji ?? '🏢'}</Text>
                  </View>
                )}
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileRole}>{profile.role}</Text>
                </View>
              </View>

              {/* About section */}
              <Text style={styles.aboutTitle}>About</Text>
              <Text style={styles.aboutText}>{profile.about}</Text>
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
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 42 : 28,
  },
  handleBar: {
    width: 40, height: 4, backgroundColor: '#CBD5E1',
    borderRadius: 2, alignSelf: 'center', marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 60, height: 60, borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  profileAvatarFallback: {
    alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarIcon: { fontSize: RFValue(30) },
  profileInfo: { flex: 1 },
  profileName: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(15),
    color: '#10375C',
    marginBottom: 4,
  },
  profileRole: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10.5),
    color: '#64748B',
  },
  aboutTitle: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(12),
    color: '#10375C',
    marginBottom: 10,
  },
  aboutText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(11),
    color: '#64748B',
    lineHeight: RFValue(17),
  },
});

export default ViewProfileModal;
