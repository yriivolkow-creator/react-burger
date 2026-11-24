import { createWebSocketMiddleware } from '@utils/websocket';

import {
  onMessage,
  wsConnectUserOrders,
  wsConnectingUserOrders,
  wsDisconnectUserOrders,
} from './userOrdersSlice';

import type { TOrdersResponse } from '@utils/types';

const actions = {
  onMessage: onMessage.type,
  wsConnect: wsConnectUserOrders.type,
  wsConnecting: wsConnectingUserOrders.type,
  wsDisconnect: wsDisconnectUserOrders.type,
};

const config = {
  onClose: (): { type: string } => ({ type: 'userOrders/onClose' }),
  onError: (error: Event): { payload: string; type: string } => ({
    payload: `WebSocket error: ${error.type}`,
    type: 'userOrders/onError',
  }),
  onMessage: (message: TOrdersResponse): { payload: TOrdersResponse; type: string } => ({
    payload: message,
    type: 'userOrders/onMessage',
  }),
  onOpen: (): { type: string } => ({ type: 'userOrders/onOpen' }),
};

export const userOrdersMiddleware = createWebSocketMiddleware<TOrdersResponse>(
  actions,
  config
);
