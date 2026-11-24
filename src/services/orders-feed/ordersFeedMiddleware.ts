import { createWebSocketMiddleware } from '@utils/websocket';

import { onMessage, wsConnect, wsConnecting, wsDisconnect } from './ordersFeedSlice';

import type { TOrdersResponse } from '@utils/types';

const actions = {
  onMessage: onMessage.type,
  wsConnect: wsConnect.type,
  wsConnecting: wsConnecting.type,
  wsDisconnect: wsDisconnect.type,
};

const config = {
  onClose: (): { type: string } => ({ type: 'ordersFeed/onClose' }),
  onError: (error: Event): { payload: string; type: string } => ({
    payload: `WebSocket error: ${error.type}`,
    type: 'ordersFeed/onError',
  }),
  onMessage: (message: TOrdersResponse): { payload: TOrdersResponse; type: string } => ({
    payload: message,
    type: 'ordersFeed/onMessage',
  }),
  onOpen: (): { type: string } => ({ type: 'ordersFeed/onOpen' }),
};

export const ordersFeedMiddleware = createWebSocketMiddleware<TOrdersResponse>(
  actions,
  config
);
