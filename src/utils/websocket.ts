import type { Middleware } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@services/store';

export type TWebSocketMessage = {
  success: boolean;
  message?: string;
};

type TWebSocketConfig<TMessage extends TWebSocketMessage> = {
  onOpen: () => { type: string };
  onClose: () => { type: string };
  onError: (error: Event) => { type: string; payload: string };
  onMessage: (message: TMessage) => { type: string; payload: TMessage };
};

type TWebSocketActions = {
  wsConnect: string;
  wsDisconnect: string;
  wsConnecting: string;
  onOpen: string;
  onClose: string;
  onError: string;
  onMessage: string;
};

export const createWebSocketMiddleware = <TMessage extends TWebSocketMessage>(
  actions: TWebSocketActions,
  config: TWebSocketConfig<TMessage>
): Middleware<unknown, RootState, AppDispatch> => {
  let socket: WebSocket | null = null;
  let url = '';
  let isConnected = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let disconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  return (store) => (next) => (action) => {
    const { dispatch } = store;

    const isConnectAction =
      typeof action.type === 'string' && action.type === actions.wsConnect;

    if (isConnectAction) {
      if (disconnectTimeout) {
        clearTimeout(disconnectTimeout);
        disconnectTimeout = null;
      }

      if (socket && isConnected) {
        socket.close();
      }

      url = (action.payload as string) ?? '';
      isConnected = false;

      socket = new WebSocket(url);

      socket.onopen = (): void => {
        isConnected = true;
        dispatch(config.onOpen());
      };

      socket.onerror = (error: Event): void => {
        dispatch(config.onError(error));
      };

      socket.onmessage = (event: MessageEvent): void => {
        const data = JSON.parse(event.data) as TMessage;

        if (!data.success && data.message === 'Invalid or missing token') {
          if (socket) {
            socket.close();
            socket = null;
          }
          window.dispatchEvent(new CustomEvent('userOrdersTokenExpired'));
          return;
        }

        dispatch(config.onMessage(data));
      };

      socket.onclose = (): void => {
        isConnected = false;
        socket = null;
        dispatch(config.onClose());
      };
    }

    if (action.type === actions.wsDisconnect) {
      disconnectTimeout = setTimeout(() => {
        if (socket && isConnected) {
          socket.close();
        }
        socket = null;
        isConnected = false;
      }, 100);

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    }

    next(action);
  };
};
