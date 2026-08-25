import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAccessToken, getUserType, clearAllTokens } from '~utils';
import { setCredentials } from '~redux/reducers/authSlice';
import { fetchProfile } from '~redux/reducers/profileSlice';
import { fetchNotifications } from '~redux/reducers/notificationsSlice';

/**
 * Runs once on cold start.
 * Reads persisted token + userType from AsyncStorage and rehydrates Redux auth state.
 * Also kicks off background profile fetch and unread notification count fetch.
 *
 * Returns `ready` — false until the check completes, so the navigator can
 * hold a splash/loading screen and avoid the unauthenticated flash.
 */
const useAppInit = () => {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        const userType = await getUserType();

        // Fail closed. Defaulting a missing type to 'company' would open the
        // company app for a subcontractor's token — wrong screens against wrong
        // endpoints, with no error to signal it. A token we cannot attribute is
        // unusable, so drop it and let the user sign in again.
        if (userType !== 'company' && userType !== 'subcontractor') {
          await clearAllTokens();
          return;
        }

        dispatch(setCredentials({ type: userType }));
        // Both run in background — don't block navigation
        dispatch(fetchProfile());
        dispatch(fetchNotifications());
      } catch {
        // If anything fails, fall through to the auth flow
      } finally {
        setReady(true);
      }
    };

    hydrate();
  }, [dispatch]);

  return ready;
};

export default useAppInit;
