type TApiErrorPayload = {
  message?: unknown;
};

export class ApiError extends Error {
  public readonly status: number;

  public constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const readErrorMessage = (payload: unknown): string | null => {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const { message } = payload as TApiErrorPayload;
  return typeof message === 'string' && message.length > 0 ? message : null;
};

export const checkResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let serverMessage: string | null = null;

    try {
      serverMessage = readErrorMessage(await response.json());
    } catch {
      serverMessage = null;
    }

    const reason = serverMessage ?? response.statusText;
    const suffix = reason ? `: ${reason}` : '';
    throw new ApiError(`Ошибка HTTP ${response.status}${suffix}`, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error('Сервер вернул некорректный JSON');
  }
};
