// Static earnings figures for the subcontractor Earnings Dashboard.
//
// There is no earnings endpoint yet. This module is shaped like the response we
// expect the API to return, so wiring it up later is a matter of swapping the
// source inside `useSubcontractorEarnings` — the screen itself stays untouched.

export const EARNINGS_MOCK = {
  currency: 'GBP',

  // Headline KPI cards.
  summary: {
    gross: 12480,
    grossChangePct: 8.2,
    grossTrend: [3, 5, 2, 8, 5, 9],

    cisDeductions: 2496,
    cisRate: 20,

    net: 9984,
    netChangePct: 8.2,
    netTrend: [3, 5, 2, 8, 5, 9],

    pending: 3200,
  },

  // Grouped bar chart — one entry per month.
  monthly: [
    {label: 'Oct', gross: 4000, cis: 1000, net: 3200},
    {label: 'Nov', gross: 4800, cis: 1200, net: 3900},
    {label: 'Dec', gross: 4800, cis: 1200, net: 3900},
  ],

  // Stacked bar + legend. `percent` drives both the segment width and the row.
  cisBreakdown: {
    total: 2496,
    categories: [
      {label: 'Labour', percent: 65, amount: 1622.4, color: '#3B82F6'},
      {label: 'Materials', percent: 20, amount: 499.2, color: '#14B8A6'},
      {label: 'Plant Hire', percent: 10, amount: 249.6, color: '#F59E0B'},
      {label: 'Other', percent: 5, amount: 124.8, color: '#64748B'},
    ],
  },

  // Week-by-week detail. `status` is one of paid | pending | processing.
  weeks: [
    {id: 1, range: '2-8 Oct', status: 'paid', gross: 960, deduction: 192, net: 768},
    {id: 2, range: '9-15 Oct', status: 'paid', gross: 1120, deduction: 224, net: 896},
    {id: 3, range: '16-22 Oct', status: 'paid', gross: 880, deduction: 176, net: 704},
    {id: 4, range: '23-29 Oct', status: 'paid', gross: 880, deduction: 176, net: 704},
    {id: 5, range: '30 Oct-5 Nov', status: 'paid', gross: 1200, deduction: 240, net: 960},
    {id: 6, range: '6-12 Nov', status: 'pending', gross: 1040, deduction: 208, net: 832},
    {id: 7, range: '13-19 Nov', status: 'pending', gross: 1120, deduction: 224, net: 896},
    {id: 8, range: '20-26 Nov', status: 'processing', gross: 960, deduction: 192, net: 768},
  ],

  ytd: {
    period: 'Oct — Nov',
    gross: 12480,
    deduction: 2496,
    net: 9984,
  },
};

// Badge palette for the weekly cards, keyed by the status the API will send.
export const STATUS_STYLES = {
  paid: {bg: '#D1FAE5', text: '#047857', label: 'Paid'},
  pending: {bg: '#FEF3C7', text: '#B45309', label: 'Pending'},
  processing: {bg: '#DBEAFE', text: '#1D4ED8', label: 'Processing'},
};

// The chart's y-axis is fixed to the design's ticks. They are unevenly spaced
// (5k / 3k / 1k / 0) and laid out with space-between, exactly as drawn; bar
// heights scale against the top tick.
export const CHART_TICKS = [5000, 3000, 1000, 0];
export const CHART_HEIGHT = 120;

// Compact money for the breakdown headline — e.g. 2496 → "£2.5k".
export const compactMoney = (amount, symbol = '£') => {
  const n = Number(amount ?? 0);
  if (n >= 1000) return `${symbol}${(n / 1000).toFixed(1)}k`;
  return `${symbol}${n.toFixed(0)}`;
};
