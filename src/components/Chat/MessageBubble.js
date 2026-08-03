/**
 * MessageBubble — shared component for individual chat messages.
 * Renders sent (right) and received (left) messages differently.
 * Supports image and file attachments.
 */
import {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Image, Linking} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {File, FileText, Check} from 'lucide-react-native';
import {Text} from '~components/Common';
import {FontFamily} from '~theme/fonts';

const IMAGE_EXTENSIONS =
  /\.(jpg|jpeg|png|gif|webp|avif|bmp|heic|heif|svg)(\?.*)?$/i;
const PDF_EXTENSIONS = /\.pdf(\?.*)?$/i;

const isImageUrl = url => typeof url === 'string' && IMAGE_EXTENSIONS.test(url);
const isPdfUrl = url => typeof url === 'string' && PDF_EXTENSIONS.test(url);

const filenameFromUrl = url => {
  try {
    const decoded = decodeURIComponent(url);
    const parts = decoded.split('/');
    return parts[parts.length - 1] || 'file';
  } catch {
    return 'file';
  }
};

const openUrl = uri => {
  Linking.openURL(uri).catch(() => {});
};

// ── Attachment renderers ──────────────────────────────────────────────────────

const AttachmentImage = ({uri}) => {
  const [errored, setErrored] = useState(false);
  if (errored) return null;
  return (
    <TouchableOpacity onPress={() => openUrl(uri)} activeOpacity={0.85}>
      <Image
        source={{uri}}
        style={styles.attachmentImage}
        resizeMode="cover"
        onError={() => setErrored(true)}
      />
    </TouchableOpacity>
  );
};

const AttachmentFile = ({uri, isSent}) => {
  const FileIcon = isPdfUrl(uri) ? FileText : File;
  const iconColor = isSent ? '#10375C' : '#FFFFFF';

  return (
    <TouchableOpacity
      style={[
        styles.filePill,
        isSent ? styles.filePillSent : styles.filePillReceived,
      ]}
      onPress={() => openUrl(uri)}
      activeOpacity={0.7}>
      <FileIcon size={RFValue(13)} color={iconColor} strokeWidth={1.8} />
      <Text
        style={[
          styles.fileText,
          isSent ? styles.fileTextSent : styles.fileTextReceived,
        ]}
        numberOfLines={1}>
        {filenameFromUrl(uri)}
      </Text>
    </TouchableOpacity>
  );
};

const AttachmentList = ({attachments, isSent, hasText}) => (
  <View style={[styles.attachmentsWrap, hasText && styles.attachmentsWithText]}>
    {attachments.map((uri, idx) =>
      isImageUrl(uri) ? (
        <AttachmentImage key={idx} uri={uri} isSent={isSent} />
      ) : (
        <AttachmentFile key={idx} uri={uri} isSent={isSent} />
      ),
    )}
  </View>
);

// ── Main component ────────────────────────────────────────────────────────────

const MessageBubble = ({message, isSent}) => {
  if (message.deletedForAll) {
    return (
      <View style={[styles.row, isSent ? styles.rowRight : styles.rowLeft]}>
        <View style={styles.deletedBubble}>
          <Text style={styles.deletedText}>🚫 You deleted this message</Text>
        </View>
      </View>
    );
  }

  if (message.deletedForMe) {
    return (
      <View style={[styles.row, isSent ? styles.rowRight : styles.rowLeft]}>
        <View style={styles.deletedBubble}>
          <Text style={styles.deletedText}>🚫 Message deleted for me</Text>
        </View>
      </View>
    );
  }

  const attachments = Array.isArray(message.attachments)
    ? message.attachments
    : [];
  const hasAttachments = attachments.length > 0;
  const hasText = !!message.text;

  return (
    <>
      <View style={[styles.row, isSent ? styles.rowRight : styles.rowLeft]}>
        {/* Received: avatar on left */}
        {!isSent &&
          (message.avatarUri ? (
            <Image source={{uri: message.avatarUri}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {(message.senderName ?? '?')[0].toUpperCase()}
              </Text>
            </View>
          ))}

        <View style={[styles.col, isSent ? styles.colRight : styles.colLeft]}>
          {/* Time row */}
          <View
            style={[
              styles.metaRow,
              isSent ? styles.metaRowRight : styles.metaRowLeft,
            ]}>
            {!isSent && (
              <Text style={styles.senderName}>{message.senderName}</Text>
            )}
            <Text style={styles.metaTime}>{message.time}</Text>
          </View>

          <View
            style={[
              styles.bubbleRow,
              isSent ? styles.bubbleRowRight : styles.bubbleRowLeft,
            ]}>
            {/* Bubble */}
            <View
              style={[
                styles.bubble,
                isSent ? styles.bubbleSent : styles.bubbleReceived,
                hasAttachments && styles.bubbleWithAttachments,
              ]}>
              {/* Text */}
              {hasText && (
                <Text
                  style={[
                    styles.bubbleText,
                    isSent && styles.bubbleTextSent,
                    hasAttachments && styles.bubbleTextPadded,
                  ]}>
                  {message.text}
                </Text>
              )}

              {/* Attachments */}
              {hasAttachments && (
                <AttachmentList
                  attachments={attachments}
                  isSent={isSent}
                  hasText={hasText}
                />
              )}
            </View>

            {/* Read receipt — sent only */}
            {isSent && (
              <View style={styles.ticks}>
                <Check size={RFValue(9)} color="#94A3B8" strokeWidth={3} />
                <Check
                  size={RFValue(9)}
                  color="#94A3B8"
                  strokeWidth={3}
                  style={{marginLeft: -7}}
                />
              </View>
            )}
          </View>
        </View>

        {/* Sent: avatar on right */}
        {isSent &&
          (message.avatarUri ? (
            <Image source={{uri: message.avatarUri}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>Me</Text>
            </View>
          ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  rowLeft: {justifyContent: 'flex-start'},
  rowRight: {justifyContent: 'flex-end'},
  avatar: {width: 30, height: 30, borderRadius: 15, backgroundColor: '#E2E8F0'},
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10375C',
  },
  avatarInitial: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(8),
    color: '#FFFFFF',
  },
  col: {maxWidth: '72%'},
  colLeft: {alignItems: 'flex-start'},
  colRight: {alignItems: 'flex-end'},

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaRowLeft: {justifyContent: 'flex-start'},
  metaRowRight: {justifyContent: 'flex-end'},
  senderName: {fontFamily: FontFamily.semiBold, fontSize: RFValue(9.5)},
  metaTime: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(8.5),
    color: '#475569',
  },

  bubbleRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  bubbleRowLeft: {justifyContent: 'flex-start'},
  bubbleRowRight: {justifyContent: 'flex-end'},

  bubble: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleWithAttachments: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  bubbleReceived: {backgroundColor: '#10375C', borderTopLeftRadius: 2},
  bubbleSent: {backgroundColor: '#EFEFEF', borderTopRightRadius: 2},

  bubbleText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    color: '#FFFFFF',
    lineHeight: RFValue(16),
  },
  bubbleTextSent: {color: '#10375C'},
  bubbleTextPadded: {paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8},

  // Attachments
  attachmentsWrap: {gap: 2},
  attachmentsWithText: {marginTop: 0},

  attachmentImage: {
    width: 200,
    height: 160,
    resizeMode: 'cover',
  },

  filePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 6,
  },
  filePillReceived: {backgroundColor: 'rgba(255,255,255,0.15)'},
  filePillSent: {backgroundColor: 'rgba(16,55,92,0.1)'},
  fileText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(10),
    flex: 1,
  },
  fileTextReceived: {color: '#FFFFFF'},
  fileTextSent: {color: '#10375C'},

  ticks: {flexDirection: 'row', alignSelf: 'flex-end', marginBottom: 2},

  // Deleted states
  deletedBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deletedText: {
    fontFamily: FontFamily.regular,
    fontSize: RFValue(10.5),
    color: '#94A3B8',
    fontStyle: 'italic',
  },
});

export default MessageBubble;
