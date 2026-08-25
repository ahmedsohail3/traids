import { useState, useEffect } from 'react';
import {
  View, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Text, Avatar } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { Star } from 'lucide-react-native';

const STAR_COUNT = 5;

const RatingModal = ({ visible, onClose, worker, jobId, onSubmit, submitting }) => {
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');

  // Pre-fill from existing rating or reset when modal opens for a new worker
  useEffect(() => {
    if (visible) {
      setRating(worker?.existingRating?.rating   ?? 0);
      setComment(worker?.existingRating?.comment ?? '');
    }
  }, [visible, worker?._id]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    await onSubmit({ jobId, subcontractorId: worker?.subcontractorId, rating, comment });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={styles.sheet}>
                <View style={styles.handleBar} />

                {/* Avatar */}
                <View style={styles.avatarWrap}>
                  <Avatar uri={worker?.avatarUri} size={80} />
                </View>

                {/* Title */}
                <Text style={styles.title}>Rate {worker?.name ?? 'Subcontractor'}</Text>
                <Text style={styles.subtitle}>
                  How Was Your Experience Working{'\n'}With {worker?.name ?? 'them'}?
                </Text>

                {/* Stars */}
                <View style={styles.starsRow}>
                  {Array.from({ length: STAR_COUNT }, (_, i) => {
                    const filled = i < rating;
                    return (
                      <TouchableOpacity key={i} onPress={() => setRating(i + 1)} activeOpacity={0.7}>
                        <Star
                          size={RFValue(28)}
                          color={filled ? '#F59E0B' : '#D1D5DB'}
                          fill={filled ? '#F59E0B' : 'transparent'}
                          strokeWidth={1.5}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Comment */}
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a Review ( Optional )"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={comment}
                  onChangeText={setComment}
                />

                {/* Submit */}
                <TouchableOpacity
                  style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={rating === 0 || submitting}
                  activeOpacity={0.85}
                >
                  {submitting
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={styles.submitBtnText}>Submit & Complete</Text>
                  }
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 23, 23, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    marginBottom: 20,
  },
  avatarWrap: {
    marginBottom: 16,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: RFValue(15),
    color: '#10375C',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: RFValue(16),
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  commentInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#10375C',
    minHeight: 100,
    marginBottom: 20,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#10375C',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#FFFFFF',
  },
});

export default RatingModal;
