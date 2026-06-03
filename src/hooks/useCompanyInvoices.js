import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchJobInvoices,
  fetchInvoiceById,
  clearJobInvoices,
  clearSelectedInvoice,
} from '~redux/reducers/companyInvoicesSlice';

const EMPTY_ARRAY = [];

const selectInvoices             = (s) => s.companyInvoices?.invoices             ?? EMPTY_ARRAY;
const selectLoading              = (s) => s.companyInvoices?.loading              ?? false;
const selectError                = (s) => s.companyInvoices?.error                ?? null;
const selectSelectedInvoice      = (s) => s.companyInvoices?.selectedInvoice      ?? null;
const selectLoadingInvoiceDetail = (s) => s.companyInvoices?.loadingInvoiceDetail ?? false;
const selectDetailError          = (s) => s.companyInvoices?.detailError          ?? null;

const useCompanyInvoices = () => {
  const dispatch = useDispatch();

  const invoices             = useSelector(selectInvoices);
  const loading              = useSelector(selectLoading);
  const error                = useSelector(selectError);
  const selectedInvoice      = useSelector(selectSelectedInvoice);
  const loadingInvoiceDetail = useSelector(selectLoadingInvoiceDetail);
  const detailError          = useSelector(selectDetailError);

  const getJobInvoices      = useCallback((jobId)     => dispatch(fetchJobInvoices(jobId)),   [dispatch]);
  const refetch             = useCallback((jobId)     => dispatch(fetchJobInvoices(jobId)),   [dispatch]);
  const getInvoiceById      = useCallback((invoiceId) => dispatch(fetchInvoiceById(invoiceId)), [dispatch]);
  const reset               = useCallback(()          => dispatch(clearJobInvoices()),         [dispatch]);
  const resetSelectedInvoice = useCallback(()         => dispatch(clearSelectedInvoice()),     [dispatch]);

  return {
    invoices, loading, error,
    selectedInvoice, loadingInvoiceDetail, detailError,
    getJobInvoices, refetch, getInvoiceById,
    reset, resetSelectedInvoice,
  };
};

export default useCompanyInvoices;
