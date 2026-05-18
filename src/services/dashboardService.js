import axiosInstance from '~utils/axiosInstance';

/**
 * GET /company/dashboard
 * Returns dashboard stats, trend, budget, and recent jobs for the authenticated company.
 */
export const getCompanyDashboardApi = () =>
  axiosInstance.get('/company/dashboard').then((r) => r.data);

/**
 * GET /subcontractor/dashboard
 * Returns dashboard stats, recommended jobs, and recent activity for the authenticated subcontractor.
 */
export const getSubcontractorDashboardApi = () =>
  axiosInstance.get('/subcontractor/dashboard').then((r) => r.data);
