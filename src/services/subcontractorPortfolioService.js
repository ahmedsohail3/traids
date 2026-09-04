import axiosInstance from '~utils/axiosInstance';

/**
 * Subcontractor portfolio ("work showcase") endpoints.
 *
 * NOTE — these paths are PROVISIONAL. At the time of writing the backend
 * exposes no portfolio API at all: `/auth/profile` returns `workExamples`
 * (a flat list of signup images) and `workHistory` (company-written reviews),
 * neither of which carries a project title, scope, parameters or gallery.
 * The paths below follow the `/subcontractor/*` convention used by
 * subcontractorProfileService and should be confirmed against the backend
 * handover before release — only these four lines need to change.
 */

/** GET /subcontractor/portfolio — every project the signed-in subcontractor owns. */
export const getPortfolioApi = () =>
  axiosInstance.get('/subcontractor/portfolio').then((r) => r.data);

/** GET /subcontractor/portfolio/:id — one project, with its gallery and review. */
export const getPortfolioItemApi = (portfolioId) =>
  axiosInstance.get(`/subcontractor/portfolio/${portfolioId}`).then((r) => r.data);

/**
 * POST /subcontractor/portfolio — create a project.
 * Multipart because the photos travel with the text fields, matching how
 * profile and document updates are already sent.
 */
export const createPortfolioItemApi = (formData) =>
  axiosInstance
    .post('/subcontractor/portfolio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

/** DELETE /subcontractor/portfolio/:id */
export const deletePortfolioItemApi = (portfolioId) =>
  axiosInstance.delete(`/subcontractor/portfolio/${portfolioId}`).then((r) => r.data);
