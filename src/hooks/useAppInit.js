import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAccessToken, getUserType } from '~utils';
import { setCredentials } from '~redux/reducers/authSlice';
import { fetchProfile } from '~redux/reducers/profileSlice';

/**
 * Runs once on cold start.
 * Reads persisted token + userType from AsyncStorage and rehydrates Redux auth state.
 * Also kicks off a background profile fetch when a session is restored.
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
          // Fetch profile in the background — don't block navigation
          dispatch(fetchProfile());
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
