export const checkResponse = async (response: Response): Promise<unknown> => {
  if (!response.ok) {
    const statusText = response.statusText ? ` ${response.statusText}` : '';

    throw new Error(`Ошибка HTTP ${response.status}${statusText}`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Сервер вернул некорректный JSON');
  }
};
