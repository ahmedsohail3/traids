import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPortfolio,
  fetchPortfolioItem,
  createPortfolioItem,
  deletePortfolioItem,
  seedSelected,
  clearSelected,
  clearPortfolioErrors,
} from '~redux/reducers/subcontractorPortfolioSlice';

/**
 * useSubcontractorPortfolio
 *
 * The signed-in subcontractor's showcased projects — the "Portfolio & Profile
 * Ratings" list on the profile screen, the project detail screen, and the
 * upload form all read from here.
 */
const useSubcontractorPortfolio = () => {
  const dispatch = useDispatch();
  const {
    items,
    loading,
    error,
    selected,
    selectedLoading,
    selectedError,
    creating,
    createError,
    deletingId,
  } = useSelector((s) => s.subcontractorPortfolio);

  const getPortfolio = useCallback(() => dispatch(fetchPortfolio()), [dispatch]);

  const getPortfolioItem = useCallback(
    (id) => dispatch(fetchPortfolioItem(id)),
    [dispatch],
  );

  // `.unwrap()` so the form can await the result and show its own error.
  const addPortfolioItem = useCallback(
    (formData) => dispatch(createPortfolioItem(formData)).unwrap(),
    [dispatch],
  );

  const removePortfolioItem = useCallback(
    (id) => dispatch(deletePortfolioItem(id)).unwrap(),
    [dispatch],
  );

  const seedPortfolioItem = useCallback(
    (item) => dispatch(seedSelected(item)),
    [dispatch],
  );

  const resetSelected = useCallback(() => dispatch(clearSelected()), [dispatch]);
  const clearErrors = useCallback(() => dispatch(clearPortfolioErrors()), [dispatch]);

  return {
    items,
    loading,
    error,
    selected,
    selectedLoading,
    selectedError,
    creating,
    createError,
    deletingId,
    getPortfolio,
    getPortfolioItem,
    addPortfolioItem,
    removePortfolioItem,
    seedPortfolioItem,
    resetSelected,
    clearErrors,
  };
};

export default useSubcontractorPortfolio;
