import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCompanySubcontractors,
  fetchCompanySubcontractorProfile,
  clearCompanySubcontractors,
  clearCompanySubcontractorProfile,
} from '~redux/reducers/companySubcontractorsSlice';

// ── Profile data mapper ────────────────────────────────────────────────────────

const complianceStatus = (expiresAt) => {
  if (!expiresAt) return 'pending';
  return new Date(expiresAt) > new Date() ? 'verified' : 'expired';
};

const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const buildCompliance = (raw) => {
  const entries = [];
  const DOCS = [
    { key: 'insurance',    label: 'Insurance' },
    { key: 'tickets',      label: 'Tickets' },
    { key: 'certification', label: 'Certification' },
  ];
  for (const { key, label } of DOCS) {
    if (raw[key]) {
      const documents = Array.isArray(raw[key].documents) ? raw[key].documents : [];
      entries.push({
        label,
        date:        formatDate(raw[key].expiresAt),
        status:      complianceStatus(raw[key].expiresAt),
        hasDocument: documents.length > 0,
        documentUrl: documents[0] ?? null,
      });
    }
  }
  return entries;
};

const mapProfile = (raw) => {
  if (!raw) return null;
  return {
    name:       raw.fullName     ?? raw.name     ?? '—',
    trade:      raw.primaryTrade ?? raw.trade    ?? '—',
    rating:     raw.averageRating ?? raw.rating  ?? 0,
    reviews:    raw.totalRatings  ?? raw.reviewCount ?? raw.reviews ?? 0,
    hourlyRate: raw.hourlyRate != null ? `£${raw.hourlyRate}/hr` : '—',
    about:      raw.professionalBio ?? raw.about ?? raw.bio ?? '',
    avatarUri:  raw.profileImage    ?? raw.avatarUri ?? null,
    location:   raw.cityLocation    ?? raw.location  ?? null,
    yearsOfExperience: raw.yearsOfExperience ?? null,
    availability:      raw.availability      ?? null,
    compliance: buildCompliance(raw),
    workHistory: (raw.workExamples ?? raw.workHistory ?? []).map((w) => ({
      title:    w.title    ?? w.jobTitle    ?? '',
      date:     w.date     ?? w.completedAt ?? '',
      rating:   w.rating   ?? 0,
      review:   w.review   ?? w.comment     ?? '',
      reviewer: w.reviewer ?? w.reviewerName ?? '',
    })),
  };
};

// ── Hook ───────────────────────────────────────────────────────────────────────

const useCompanySubcontractors = () => {
  const dispatch = useDispatch();

  const list    = useSelector((s) => s.companySubcontractors.list);
  const profileState = useSelector((s) => s.companySubcontractors.profile);

  // ── List ─────────────────────────────────────────────────────────────────────
  const subcontractors = list.data ?? [];

  const fetch = useCallback((filters = {}) => dispatch(fetchCompanySubcontractors(filters)), [dispatch]);
  const reset = useCallback(() => dispatch(clearCompanySubcontractors()), [dispatch]);

  // ── Profile ──────────────────────────────────────────────────────────────────
  const profile = mapProfile(profileState.data);

  const getProfile   = useCallback((id) => dispatch(fetchCompanySubcontractorProfile(id)), [dispatch]);
  const resetProfile = useCallback(() => dispatch(clearCompanySubcontractorProfile()), [dispatch]);

  return {
    // List
    subcontractors,
    loading:  list.loading,
    error:    list.error,
    hasData:  subcontractors.length > 0,
    fetch,
    reset,

    // Profile
    profile,
    profileLoading: profileState.loading,
    profileError:   profileState.error,
    getProfile,
    resetProfile,
  };
};

export default useCompanySubcontractors;
