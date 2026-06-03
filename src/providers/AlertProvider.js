import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { Modal } from 'react-native';
import CustomAlert from '~components/CustomAlert/CustomAlert';
import CustomPrompt from '~components/CustomAlert/CustomPrompt';

const AlertContext = createContext(null);

export const useAlertContext = () => useContext(AlertContext);

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
 * The Modal is rendered at native level (OS window), so it safely overlays all
 * existing screens, bottom sheets, dropdowns, and modals inside the app.
 */
const AlertProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  // Separate visible flag so we can animate out before dequeuing
  const [isVisible, setIsVisible] = useState(false);
  const dismissingRef = useRef(false);

  const current = queue[0] ?? null;

  // When a new item enters an empty queue, show it
  useEffect(() => {
    if (queue.length > 0 && !isVisible && !dismissingRef.current) {
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

  const hideAlert = useCallback(() => {
    // Signals the current dialog to play its exit animation then call handleDismissed
    if (isVisible) setIsVisible(false);
  }, [isVisible]);

  // ─────────────────────────────────────────────────────────────────────────────

  const isPrompt = current?.dialogType === 'prompt';

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showPrompt, hideAlert }}>
      {children}

      {current && (
        <Modal
          visible={isVisible}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={() => {
            // Android back button — let the dialog component handle it
          }}>
          {isPrompt ? (
            <CustomPrompt
              key={current.id}
              config={current}
              onDismiss={handleDismissed}
            />
          ) : (
            <CustomAlert
              key={current.id}
              config={current}
              onDismiss={handleDismissed}
            />
          )}
        </Modal>
      )}
    </AlertContext.Provider>
  );
};

export default AlertProvider;
