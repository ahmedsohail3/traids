import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { Modal, Platform } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';
import CustomAlert from '~components/CustomAlert/CustomAlert';
import CustomPrompt from '~components/CustomAlert/CustomPrompt';

const AlertContext = createContext(null);

export const useAlertContext = () => useContext(AlertContext);

// iOS presents each RN <Modal> as its own view controller off the one hosting it.
// Asking the root controller to present a second modal while a first is already
// up — an alert raised from inside a bottom sheet, which is most of them — is
// refused by UIKit and fails silently: the alert is enqueued and never seen.
// FullWindowOverlay attaches its content straight to the key UIWindow, above
// whatever controller is currently presented, so the alert shows wherever it
// was raised from. It only takes touches its own subviews cover, so it never
// blocks the app underneath.
//
// Android keeps the Modal: there it is a Dialog, and dialogs stack correctly.
const AlertHost = ({ children }) => (
  Platform.OS === 'ios' ? (
    <FullWindowOverlay unstable_accessibilityContainerViewIsModal>
      {children}
    </FullWindowOverlay>
  ) : (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        // Android back button — let the dialog component handle it
      }}>
      {children}
    </Modal>
  )
);

let _nextId = 0;
const nextId = () => {
  _nextId += 1;
  return _nextId;
};

/**
 * AlertProvider
 *
 * Wraps the application and exposes showAlert / showConfirm / showPrompt / hideAlert.
 * Renders exactly one alert at a time. Any extras are queued and shown in order.
 *
 * The dialog is hosted above every other layer of the app — see AlertHost.
 */
const AlertProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  // Separate visible flag so we can animate out before dequeuing
  const [isVisible, setIsVisible] = useState(false);
  // Set by hideAlert() — asks the mounted dialog to play its exit animation.
  const [dismissRequested, setDismissRequested] = useState(false);
  const dismissingRef = useRef(false);

  const current = queue[0] ?? null;

  // When a new item enters an empty queue, show it
  useEffect(() => {
    if (queue.length > 0 && !isVisible && !dismissingRef.current) {
      // Clear any stale request so the incoming dialog never mounts pre-dismissed.
      setDismissRequested(false);
      setIsVisible(true);
    }
  }, [queue, isVisible]);

  const enqueue = useCallback((config) => {
    const id = nextId();
    setQueue((prev) => [...prev, { ...config, id }]);
  }, []);

  /**
   * Called by the dialog component after its exit animation completes.
   * Dequeues the current item and shows the next one (if any) after a brief gap.
   */
  const handleDismissed = useCallback(() => {
    dismissingRef.current = true;
    setDismissRequested(false);
    setIsVisible(false);
    setQueue((prev) => {
      const next = prev.slice(1);
      if (next.length > 0) {
        // Small gap between consecutive alerts for a clean UX
        setTimeout(() => {
          dismissingRef.current = false;
          setIsVisible(true);
        }, 120);
      } else {
        dismissingRef.current = false;
      }
      return next;
    });
  }, []);

  // ─── Public API ──────────────────────────────────────────────────────────────

  const showAlert = useCallback(
    (config) => {
      enqueue({
        type: config.type ?? 'default',
        dialogType: 'alert',
        showCancel: false,
        confirmText: 'OK',
        ...config,
      });
    },
    [enqueue],
  );

  const showConfirm = useCallback(
    (config) => {
      enqueue({
        type: config.type ?? 'default',
        dialogType: 'confirm',
        showCancel: true,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        ...config,
      });
    },
    [enqueue],
  );

  const showPrompt = useCallback(
    (config) => {
      enqueue({
        dialogType: 'prompt',
        confirmText: 'Submit',
        cancelText: 'Cancel',
        ...config,
      });
    },
    [enqueue],
  );

  // Signals the current dialog to play its exit animation; it then calls
  // handleDismissed, which dequeues it and shows the next one. Hiding without
  // that round trip would leave the item at the head of the queue and stall
  // every alert raised afterwards.
  // No-ops when nothing is on screen: a request left standing would dismiss the
  // next alert the moment it mounted.
  const hideAlert = useCallback(() => {
    if (current && isVisible) setDismissRequested(true);
  }, [current, isVisible]);

  // ─────────────────────────────────────────────────────────────────────────────

  const isPrompt = current?.dialogType === 'prompt';

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showPrompt, hideAlert }}>
      {children}

      {current && isVisible && (
        <AlertHost>
          {isPrompt ? (
            <CustomPrompt
              key={current.id}
              config={current}
              dismissRequested={dismissRequested}
              onDismiss={handleDismissed}
            />
          ) : (
            <CustomAlert
              key={current.id}
              config={current}
              dismissRequested={dismissRequested}
              onDismiss={handleDismissed}
            />
          )}
        </AlertHost>
      )}
    </AlertContext.Provider>
  );
};

export default AlertProvider;
