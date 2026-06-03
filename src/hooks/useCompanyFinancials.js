import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchFinancialSummary,
  clearFinancialSummary,
} from '~redux/reducers/companyFinancialsSlice';

const selectFinancialSummary = (s) => s.companyFinancials?.financialSummary ?? null;
const selectLoading          = (s) => s.companyFinancials?.loading          ?? false;
const selectError            = (s) => s.companyFinancials?.error            ?? null;

const useCompanyFinancials = () => {
  const dispatch = useDispatch();

  const financialSummary = useSelector(selectFinancialSummary);
  const loading          = useSelector(selectLoading);
  const error            = useSelector(selectError);

  const getFinancialSummary    = useCallback(() => dispatch(fetchFinancialSummary()), [dispatch]);
  const refetchFinancialSummary = useCallback(() => dispatch(fetchFinancialSummary()), [dispatch]);
  const reset                  = useCallback(() => dispatch(clearFinancialSummary()), [dispatch]);

  return { financialSummary, loading, error, getFinancialSummary, refetchFinancialSummary, reset };
};

export default useCompanyFinancials;
