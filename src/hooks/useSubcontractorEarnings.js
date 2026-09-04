import {useCallback, useEffect, useState} from 'react';
import {EARNINGS_MOCK} from '~screens/menu/earnings/earningsData';

/**
 * Earnings for the subcontractor dashboard.
 *
 * The backend has no earnings endpoint yet, so this serves the static payload
 * from `earningsData` behind the same `{ data, loading, error, refresh }`
 * surface the other data hooks expose. When the endpoint lands, replace the
 * body of `refresh` with the dispatch/service call — nothing else has to move.
 */
const useSubcontractorEarnings = () => {
  const [data, setData] = useState(EARNINGS_MOCK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    // TODO: swap for the earnings endpoint once it exists.
    setLoading(false);
    setError(null);
    setData(EARNINGS_MOCK);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {data, loading, error, refresh};
};

export default useSubcontractorEarnings;
