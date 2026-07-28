import { useEffect, useRef } from 'react';

// Leaves a little breathing room above the field once it's scrolled into view
const SCROLL_PADDING = 24;

/**
 * useScrollToFieldError
 *
 * Scrolls a RegisterContainer back up to the first watched field that carries an
 * error — used for the server-validated fields (email, registration number,
 * work email, phone number) whose errors arrive after the user has already
 * scrolled down to the Continue button.
 *
 * Usage:
 *   const { scrollRef, onContentLayout, registerField } = useScrollToFieldError(errors, ['email']);
 *   <RegisterContainer scrollRef={scrollRef} onContentLayout={onContentLayout}>
 *     <View {...registerField('email')}><TextInput … /></View>
 *   </RegisterContainer>
 *
 * @param {Object} errors — field → message map from the signup hook
 * @param {string[]} fields — fields to watch, in the order they appear on screen
 */
const useScrollToFieldError = (errors, fields) => {
  const scrollRef = useRef(null);
  const contentY  = useRef(0);
  const offsets   = useRef({});

  // Callers pass a fresh array literal each render — keep it out of the deps
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const watched = fields.join(',');

  // y of the container's content block within the scroll view
  const onContentLayout = (e) => {
    contentY.current = e.nativeEvent.layout.y;
  };

  // Spread onto the View wrapping a watched field
  const registerField = (field) => ({
    onLayout: (e) => { offsets.current[field] = e.nativeEvent.layout.y; },
  });

  useEffect(() => {
    const field = fieldsRef.current.find((f) => errors[f]);
    if (!field) return;

    const y = offsets.current[field];
    if (y == null) return;   // not laid out yet

    scrollRef.current?.scrollTo({
      y: Math.max(contentY.current + y - SCROLL_PADDING, 0),
      animated: true,
    });
  }, [errors, watched]);

  return { scrollRef, onContentLayout, registerField };
};

export default useScrollToFieldError;
