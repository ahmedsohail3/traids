/**
 * socketHelpers.js
 *
 * Pure utility functions for the socket layer.
 * Converts raw socket event payloads into structured notification objects
 * that match the shape expected by notificationsSlice.
 */
import { SOCKET_EVENTS } from './socketEvents';

let _idCounter = 0;
const localId = (prefix) => `local_${prefix}_${Date.now()}_${++_idCounter}`;

/**
 * Build a notification object from a socket event payload.
 * The returned shape mirrors what the REST API returns.
 */
export const buildNotificationFromEvent = (eventType, payload) => {
  const now = new Date().toISOString();

  switch (eventType) {
    case SOCKET_EVENTS.NEW_MESSAGE:
      return {
        _id:            localId('msg'),
        type:           'newMessage',
        title:          'New Message',
        message:        payload.preview ?? 'You have a new message',
        senderName:     payload.senderName ?? null,
        conversationId: payload.conversationId ?? null,
        isRead:         false,
        createdAt:      now,
      };

    case SOCKET_EVENTS.NEW_JOB_APPLICATION:
      return {
        _id:        localId('jobApp'),
        type:       'newJobApplication',
        title:      'New Job Application',
        message:    `${payload.subcontractorName ?? 'Someone'} applied for your job`,
        senderName: payload.subcontractorName ?? null,
        jobId:      payload.jobId ?? null,
        isRead:     false,
        createdAt:  payload.appliedAt ?? now,
      };

    case SOCKET_EVENTS.OFFER_ACCEPTED:
      return {
        _id:        localId('offerAcc'),
        type:       'offerAccepted',
        title:      'Offer Accepted',
        message:    `${payload.subcontractorName ?? 'A subcontractor'} accepted your offer for "${payload.jobTitle ?? 'a job'}"`,
        senderName: payload.subcontractorName ?? null,
        jobId:      payload.jobId ?? null,
        isRead:     false,
        createdAt:  now,
      };

    case SOCKET_EVENTS.OFFER_REJECTED:
      return {
        _id:        localId('offerRej'),
        type:       'applicationRejected',
        title:      'Offer Rejected',
        message:    `${payload.subcontractorName ?? 'A subcontractor'} declined your offer for "${payload.jobTitle ?? 'a job'}"`,
        senderName: payload.subcontractorName ?? null,
        isRead:     false,
        createdAt:  now,
      };

    case SOCKET_EVENTS.JOB_STATUS_UPDATE:
      return {
        _id:      localId('jobStatus'),
        type:     'jobOffer',
        title:    'Job Status Updated',
        message:  `"${payload.jobTitle ?? 'A job'}" status changed to ${payload.status ?? 'unknown'}`,
        jobId:    payload.jobId ?? null,
        isRead:   false,
        createdAt: now,
      };

    case SOCKET_EVENTS.APPLICATION_ACCEPTED:
      return {
        _id:      localId('appAcc'),
        type:     'offerAccepted',
        title:    'Application Accepted',
        message:  payload.message ?? 'Your application has been accepted!',
        jobId:    payload.jobId ?? null,
        isRead:   false,
        createdAt: now,
      };

    case SOCKET_EVENTS.APPLICATION_REJECTED:
      return {
        _id:      localId('appRej'),
        type:     'applicationRejected',
        title:    'Application Rejected',
        message:  payload.message ?? 'Your application was not selected this time.',
        jobId:    payload.jobId ?? null,
        isRead:   false,
        createdAt: now,
      };

    case SOCKET_EVENTS.OFFER_RECEIVED:
      return {
        _id:      localId('offerRcv'),
        type:     'jobOffer',
        title:    'New Job Offer',
        message:  `You received a job offer${payload.jobTitle ? ` for "${payload.jobTitle}"` : ''}`,
        jobId:    payload.jobId ?? null,
        isRead:   false,
        createdAt: now,
      };

    case SOCKET_EVENTS.JOB_ASSIGNED:
      return {
        _id:      localId('jobAsgn'),
        type:     'jobOffer',
        title:    'Job Assigned',
        message:  `You have been assigned to "${payload.jobTitle ?? 'a job'}"`,
        jobId:    payload.jobId ?? null,
        isRead:   false,
        createdAt: now,
      };

    default:
      return null;
  }
};

/**
 * Build a lightweight toast event object from a socket event.
 * This is stored in socketSlice for the in-app toast banner.
 */
export const buildToastEvent = (eventType, payload) => {
  const notification = buildNotificationFromEvent(eventType, payload);
  if (!notification) return null;
  return {
    id:         notification._id,
    type:       notification.type,
    title:      notification.title,
    message:    notification.message,
    senderName: notification.senderName ?? null,
    timestamp:  notification.createdAt,
  };
};
