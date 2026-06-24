// All Socket.IO event name constants — single source of truth

export const SOCKET_EVENTS = {
  // ── Transport lifecycle ──────────────────────────────────────────────────────
  CONNECT:        'connect',
  DISCONNECT:     'disconnect',
  CONNECT_ERROR:  'connect_error',
  RECONNECT:      'reconnect',

  // ── Server → client: connection ack ─────────────────────────────────────────
  CONNECTED: 'connected', // payload: { message, userId, userType }

  // ── Chat: global (user NOT in conversation room) ─────────────────────────────
  NEW_MESSAGE: 'newMessage',
  // payload: { conversationId, senderId, senderName, preview }

  // ── Chat: room-scoped (user IS in conversation room) ─────────────────────────
  MESSAGE_NEW: 'message:new',
  // payload: { conversationId, messageId, senderId, senderName, senderType,
  //            content, attachments, preview, createdAt, jobId?, jobTitle? }

  // ── Room management: client → server ─────────────────────────────────────────
  JOIN_CONVERSATION:  'joinConversation',  // payload: { conversationId }
  LEAVE_CONVERSATION: 'leaveConversation', // payload: { conversationId }

  // ── Company events ────────────────────────────────────────────────────────────
  NEW_JOB_APPLICATION: 'newJobApplication',
  // payload: { applicationId, jobId, subcontractorName, appliedAt }

  OFFER_ACCEPTED: 'offerAccepted',
  // payload: { offerId, jobTitle, subcontractorName }

  OFFER_REJECTED: 'offerRejected',
  // payload: { offerId, jobTitle, subcontractorName }

  JOB_STATUS_UPDATE: 'jobStatusUpdate',
  // payload: { jobId, jobTitle, status }

  // ── Subcontractor events ─────────────────────────────────────────────────────
  APPLICATION_ACCEPTED: 'applicationAccepted',
  APPLICATION_REJECTED: 'applicationRejected',
  OFFER_RECEIVED:       'offerReceived',
  JOB_ASSIGNED:         'jobAssigned',
};
