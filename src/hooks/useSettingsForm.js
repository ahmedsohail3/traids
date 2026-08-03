import { useCallback, useEffect, useMemo, useState } from 'react';

// Settings tabs hold flat objects of primitives and file descriptors
// ({ uri, type, name, isNew }), so one level of key comparison is enough.
const sameValue = (a, b) => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  return keysA.length === keysB.length && keysA.every((k) => a[k] === b[k]);
};

/**
 * useSettingsForm
 *
 * Local state for a settings tab plus the `dirty` flag its Save button needs —
 * the button stays disabled until the user actually edits something.
 *
 * The values are re-seeded (and re-baselined) whenever `seed` produces a new
 * result from a freshly fetched profile, so a successful save — which refetches
 * the profile — leaves the button disabled again.
 *
 * `seed` must be declared at module scope: it is a dependency of the re-seeding
 * effect, so an inline arrow would reset the form on every render.
 *
 * @param {Object|null} source — profile the values come from (null before load)
 * @param {(source: Object) => Object} seed — maps the profile to flat values
 * @returns {{ values, setValue, setValues, dirty, reset }}
 */
const useSettingsForm = (source, seed) => {
  const seeded = useMemo(() => seed(source ?? {}), [source, seed]);

  const [values, setValues]     = useState(seeded);
  const [baseline, setBaseline] = useState(seeded);

  useEffect(() => {
    setValues(seeded);
    setBaseline(seeded);
  }, [seeded]);

  const setValue = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setValues(baseline), [baseline]);

  const dirty = useMemo(
    () => Object.keys(values).some((k) => !sameValue(values[k], baseline[k])),
    [values, baseline],
  );

  return { values, setValue, setValues, dirty, reset };
};

export default useSettingsForm;
