import { useState } from 'react';

import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

type TFormValues = Record<string, string>;

type TUseFormResult<TValues extends TFormValues> = {
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  setValues: Dispatch<SetStateAction<TValues>>;
  values: TValues;
};

export const useForm = <TValues extends TFormValues>(
  initialValues: TValues
): TUseFormResult<TValues> => {
  const [values, setValues] = useState<TValues>(initialValues);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;

    setValues((currentValues) => ({ ...currentValues, [name]: value }) as TValues);
  };

  return { handleChange, setValues, values };
};
