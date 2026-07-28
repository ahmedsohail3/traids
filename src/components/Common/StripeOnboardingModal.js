import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Feather';
import { WebView } from 'react-native-webview';
import AppText from './Text';
import Button from './Button';
import { useTheme } from '~context/ThemeContext';

// The backend's return_url already carries this marker for the web app —
// catching it here keeps onboarding in-app, with no deep link to register.
const RETURN_MARKER = 'stripeReturn=true';

const ERROR_TITLE = "Couldn't reach Stripe";

/**
 * StripeOnboardingModal
 *
 * Full-screen in-app WebView for Stripe Connect Express onboarding.
 * Watches navigation for the backend's return URL and reports completion,
 * so the user never leaves the app for a browser tab.
 *
 * Props:
 *   url        – hosted onboarding URL (modal is hidden when null)
 *   onClose    – dismissed without finishing (back arrow / hardware back)
 *   onComplete – Stripe redirected to the return URL
 *   title      – header label
 */
const StripeOnboardingModal = ({ url, onClose, onComplete, title = 'Bank Setup' }) => {
  const { colors } = useTheme();
  const webViewRef = useRef(null);
  const [loadError, setLoadError] = useState(null);

  // A fresh link always starts a fresh attempt
  useEffect(() => {
    if (url) setLoadError(null);
  }, [url]);

  const handleNavigationChange = useCallback((navState) => {
    if (navState.url?.includes(RETURN_MARKER)) onComplete();
  }, [onComplete]);

  // Network-level failures (DNS, offline, TLS) render blank without this
  const handleError = useCallback(({ nativeEvent }) => {
    setLoadError(nativeEvent?.description || 'The page could not be loaded.');
  }, []);

  const handleRetry = useCallback(() => {
    setLoadError(null);
    webViewRef.current?.reload();
  }, []);

  return (
    <Modal
      visible={!!url}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border ?? '#E2E8F0' }]}>
          <TouchableOpacity onPress={onClose} hitSlop={8} activeOpacity={0.7}>
            <Icon name="arrow-left" size={RFValue(16)} color={colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="sectionTitle" style={{ color: colors.textPrimary }}>
            {title}
          </AppText>
        </View>

        {!!url && (
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            onNavigationStateChange={handleNavigationChange}
            onError={handleError}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          />
        )}

        {!!loadError && (
          <View style={[styles.errorOverlay, { backgroundColor: colors.background }]}>
            <Icon name="wifi-off" size={RFValue(28)} color={colors.textMuted} />
            <AppText variant="sectionTitle" style={{ color: colors.textPrimary }}>
              {ERROR_TITLE}
            </AppText>
            <AppText style={[styles.errorBody, { color: colors.textMuted }]}>
              {loadError}
            </AppText>
            <Button title="Try Again" onPress={handleRetry} style={styles.retryBtn} />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: RFValue(48),          // sits below the header so Back stays reachable
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  errorBody: {
    textAlign: 'center',
    fontSize: RFValue(10),
  },
  retryBtn: {
    marginTop: 6,
    minWidth: RFValue(140),
  },
});

export default StripeOnboardingModal;
