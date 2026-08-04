import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { handleNextAction } from '@stripe/stripe-react-native';
import {
  fetchCompanyInvoices,
  fetchJobInvoices,
  fetchInvoiceById,
  clearCompanyInvoices,
  clearJobInvoices,
  clearSelectedInvoice,
  payInvoice,
  markInvoicePaid,
  clearPayError,
  setPayError,
} from '~redux/reducers/companyInvoicesSlice';

const EMPTY_ARRAY = [];

const selectInvoices             = (s) => s.companyInvoices?.invoices             ?? EMPTY_ARRAY;
const selectAllInvoices          = (s) => s.companyInvoices?.allInvoices          ?? EMPTY_ARRAY;
const selectLoadingAll           = (s) => s.companyInvoices?.loadingAll           ?? false;
const selectAllError             = (s) => s.companyInvoices?.allError             ?? null;
const selectLoading              = (s) => s.companyInvoices?.loading              ?? false;
const selectError                = (s) => s.companyInvoices?.error                ?? null;
const selectSelectedInvoice      = (s) => s.companyInvoices?.selectedInvoice      ?? null;
const selectLoadingInvoiceDetail = (s) => s.companyInvoices?.loadingInvoiceDetail ?? false;
const selectDetailError          = (s) => s.companyInvoices?.detailError          ?? null;
const selectPaying               = (s) => s.companyInvoices?.paying               ?? false;
const selectPayError             = (s) => s.companyInvoices?.payError             ?? null;

const useCompanyInvoices = () => {
  const dispatch = useDispatch();

  const invoices             = useSelector(selectInvoices);
  const allInvoices          = useSelector(selectAllInvoices);
  const loadingAll           = useSelector(selectLoadingAll);
  const allError             = useSelector(selectAllError);
  const loading              = useSelector(selectLoading);
  const error                = useSelector(selectError);
  const selectedInvoice      = useSelector(selectSelectedInvoice);
  const loadingInvoiceDetail = useSelector(selectLoadingInvoiceDetail);
  const detailError          = useSelector(selectDetailError);
  const paying               = useSelector(selectPaying);
  const payError             = useSelector(selectPayError);

  // Every invoice for the company — powers the Financial Tools list.
  const getCompanyInvoices   = useCallback(()         => dispatch(fetchCompanyInvoices()),     [dispatch]);
  const resetCompanyInvoices = useCallback(()         => dispatch(clearCompanyInvoices()),     [dispatch]);

  const getJobInvoices      = useCallback((jobId)     => dispatch(fetchJobInvoices(jobId)),   [dispatch]);
  const refetch             = useCallback((jobId)     => dispatch(fetchJobInvoices(jobId)),   [dispatch]);
  const getInvoiceById      = useCallback((invoiceId) => dispatch(fetchInvoiceById(invoiceId)), [dispatch]);
  const reset               = useCallback(()          => dispatch(clearJobInvoices()),         [dispatch]);
  const resetSelectedInvoice = useCallback(()         => dispatch(clearSelectedInvoice()),     [dispatch]);

  /**
   * Charges the invoice against the company's saved card. The backend confirms
   * off-session, so this normally settles in one call; if the bank demands 3DS
   * anyway, the challenge is resolved in-app before the invoice is marked paid.
   *
   * @returns {Promise<boolean>} true once the payment has settled
   */
  const pay = useCallback(async (invoiceId) => {
    try {
      const result = await dispatch(payInvoice(invoiceId)).unwrap();

      if (result.status === 'requires_action') {
        // 3DS resolution happens after the thunk settles, so its failures are
        // pushed back into the slice by hand
        if (!result.clientSecret) {
          dispatch(setPayError('This payment needs extra authentication, which is not available yet.'));
          return false;
        }
        const { error: actionError } = await handleNextAction(result.clientSecret);
        if (actionError) {
          dispatch(setPayError(actionError.message ?? 'Card authentication failed.'));
          return false;
        }
        dispatch(markInvoicePaid(invoiceId));
      }

      return true;
    } catch {
      return false;   // thunk failure — message is already in payError
    }
  }, [dispatch]);

  const dismissPayError = useCallback(() => dispatch(clearPayError()), [dispatch]);

  return {
    invoices, loading, error,
    allInvoices, loadingAll, allError,
    selectedInvoice, loadingInvoiceDetail, detailError,
    getCompanyInvoices, resetCompanyInvoices,
    getJobInvoices, refetch, getInvoiceById,
    reset, resetSelectedInvoice,
    paying, payError, pay, dismissPayError,
  };
};

export default useCompanyInvoices;
