/**
 * CertificateCard — one row of the profile's "Certificates" block.
 *
 * The status glyph and the expiry line are both derived from the same state so
 * they can never disagree: a card showing a green tick always has a document
 * that is in date.
 *
 * Props:
 *   icon         Lucide component rendered in the tinted circle
 *   title        string
 *   expiresAt    string|null   ISO date; null means "no expiry recorded"
 *   documentUrl  string|null   omitting it hides the download button
 */
import { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';
import { Text } from '~components/Common';
import { FontFamily } from '~theme/fonts';
import { openDocument } from '~utils/openDocument';
import useAlert from '~hooks/useAlert';

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRING_SOON_DAYS = 30;

const formatDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Four states, in priority order: nothing uploaded → expired → expiring soon →
 * valid. `expiresAt` is only meaningful once a document exists.
 */
const deriveStatus = (documentUrl, expiresAt) => {
  if (!documentUrl) {
    return { tone: 'missing', label: 'Not uploaded' };
  }
  const formatted = expiresAt ? formatDate(expiresAt) : null;
  if (!formatted) {
    return { tone: 'valid', label: 'Valid (No Expiry)' };
  }

  const daysLeft = Math.floor((new Date(expiresAt).getTime() - Date.now()) / DAY_MS);
  if (daysLeft < 0) return { tone: 'expired', label: `Expired ${formatted}` };
  if (daysLeft <= EXPIRING_SOON_DAYS) return { tone: 'soon', label: 'Expiring soon....' };
  return { tone: 'valid', label: formatted };
};

const STATUS_STYLE = {
  valid:   { Icon: CheckCircle2, color: '#22C55E', textColor: '#334155' },
  soon:    { Icon: AlertCircle,  color: '#F2A154', textColor: '#EF4444' },
  expired: { Icon: XCircle,      color: '#EF4444', textColor: '#EF4444' },
  missing: { Icon: XCircle,      color: '#EF4444', textColor: '#9A9A9A' },
};

const CertificateCard = ({ icon: IconComp, title, expiresAt, documentUrl }) => {
  const { showAlert } = useAlert();
  const [opening, setOpening] = useState(false);

  const status = deriveStatus(documentUrl, expiresAt);
  const { Icon: StatusIcon, color, textColor } = STATUS_STYLE[status.tone];

  const handleDownload = useCallback(async () => {
    if (opening) return;
    setOpening(true);
    try {
      await openDocument(documentUrl);
    } catch (err) {
      showAlert({
        title: 'Download Failed',
        message: err?.message ?? 'Could not open this document.',
        type: 'error',
      });
    } finally {
      setOpening(false);
    }
  }, [opening, documentUrl, showAlert]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBg}>
          {IconComp && <IconComp size={RFValue(14)} color="#16A34A" strokeWidth={1.8} />}
        </View>
        <StatusIcon size={RFValue(17)} color={color} strokeWidth={2} />
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.expiryLabel}>Expiry Date</Text>
        <Text style={[styles.expiryValue, { color: textColor }]}>{status.label}</Text>
      </View>

      {!!documentUrl && (
        <TouchableOpacity
          style={styles.downloadBtn}
          activeOpacity={0.8}
          disabled={opening}
          onPress={handleDownload}>
          {opening ? (
            <ActivityIndicator size="small" color="#10375C" />
          ) : (
            <Text style={styles.downloadText}>Download Copy</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    padding: RFValue(11),
    gap: RFValue(9),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBg: {
    width: RFValue(30),
    height: RFValue(30),
    borderRadius: RFValue(15),
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: { gap: 2 },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: RFValue(12),
    color: '#334155',
  },
  expiryLabel: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(9),
    color: '#9A9A9A',
  },
  expiryValue: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
  },
  downloadBtn: {
    height: RFValue(34),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadText: {
    fontFamily: FontFamily.medium,
    fontSize: RFValue(11),
    color: '#10375C',
  },
});

export default CertificateCard;
