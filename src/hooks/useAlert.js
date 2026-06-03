import { useAlertContext } from '../providers/AlertProvider';

/**
 * useAlert
 *
 * Provides centralized alert helpers that overlay all screens and modals.
 *
 * @returns {{
 *   showAlert:   (config: AlertConfig) => void,
 *   showConfirm: (config: ConfirmConfig) => void,
 *   showPrompt:  (config: PromptConfig) => void,
 *   hideAlert:   () => void,
 * }}
 *
 * Examples:
 *
 *   showAlert({ title: 'Success', message: 'Saved.', type: 'success' })
 *
 *   showConfirm({
 *     title: 'Delete Job',
 *     message: 'This cannot be undone.',
 *     confirmText: 'Delete',
 *     type: 'error',
 *     onConfirm: handleDelete,
 *   })
 *
 *   showPrompt({
 *     title: 'Rename',
 *     placeholder: 'Enter name',
 *     onSubmit: (value) => save(value),
 *   })
 */
const useAlert = () => useAlertContext();

export default useAlert;
