import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAccessToken, getUserType } from '~utils';
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

        if (token) {
          const userType = await getUserType();
          dispatch(setCredentials({ type: userType ?? 'company' }));
          // Both run in background — don't block navigation
          dispatch(fetchProfile());
          dispatch(fetchNotifications());
        }
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
