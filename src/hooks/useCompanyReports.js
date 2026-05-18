import { useSelector, useDispatch } from 'react-redux';
import { fetchCompanyReports, clearCompanyReports } from '~redux/reducers/companyReportsSlice';

// ── Mapper ────────────────────────────────────────────────────────────────────
// The API already returns pre-formatted strings and shaped objects.
// We just normalise nulls/missing keys so the UI never crashes.
const mapReports = (raw) => {
  if (!raw) return null;

  const s = raw.stats ?? {};

  return {
    stats: {
      totalSpend:             s.totalSpend            ?? '£0',
      totalSpendSub:          s.totalSpendSub         ?? '',
      totalSpendPositive:     s.totalSpendPositive    ?? false,
      activeProjects:         s.activeProjects        ?? 0,
      activeProjectsSub:      s.activeProjectsSub     ?? '',
      activeProjectsPositive: s.activeProjectsPositive ?? false,
      avgRating:              s.avgRating             ?? '0.0/5.0',
      onTimeCompletion:       s.onTimeCompletion      ?? '0%',
      onTimeSub:              s.onTimeSub             ?? '',
      onTimePositive:         s.onTimePositive        ?? false,
    },

    // [{ month, labor, materials }]
    spendTrend: raw.spendTrend ?? [],

    // { items: [{ label, value, color, display }], total }
    costDistribution: raw.costDistribution ?? { items: [], total: 0 },

    // [{ id, name, manager, status, budget, actual, actualWarning }]
    projectCosts: raw.projectCosts ?? [],

    // [{ id, name, trade, jobs, spend, rating, onTime, verified }]
    topContractors: raw.topContractors ?? [],
  };
};

// ── Hook ──────────────────────────────────────────────────────────────────────
const useCompanyReports = () => {
  const dispatch = useDispatch();
  const { data: raw, loading, error } = useSelector((s) => s.companyReports);

  const reports = mapReports(raw);
  const hasData = !!reports;

  const getReports = () => dispatch(fetchCompanyReports());
  const reset      = () => dispatch(clearCompanyReports());

  return { reports, loading, error, hasData, getReports, reset };
};

export default useCompanyReports;
