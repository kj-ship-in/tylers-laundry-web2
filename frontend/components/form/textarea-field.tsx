'use client';

import React, { type FC } from 'react';

import { useController, type Control, type FieldValues } from 'react-hook-form';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

type TextareaFieldProps = {
  name?: string;
  control?: Control<FieldValues | any>;
  label: string;
  labelColor?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

// Controlled version using react-hook-form
const ControlledTextareaField: FC<
  TextareaFieldProps & { control: Control<any>; name: string }
> = ({
  name,
  control,
  label,
  labelColor = '#444',
  placeholder = '',
  rows = 3,
  disabled = false,
  onChange,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div className='w-full space-y-2'>
      <Label style={{ color: labelColor }}>{label}</Label>
      <Textarea
        {...field}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className='border border-blue-500/50 rounded-md focus:shadow-[0 0 5px rgba(0, 123, 255, 0.5)] placeholder:text-gray-500/50 text-gray-500'
        onChange={e => {
          field.onChange(e);
          if (onChange) {
            onChange(e);
          }
        }}
      />
      {error && <p className='text-sm text-red-500'>{error.message}</p>}
    </div>
  );
};

// Uncontrolled version for plain textareas
const UncontrolledTextareaField: FC<
  Omit<TextareaFieldProps, 'control' | 'name'> & {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  }
> = ({
  label,
  labelColor = '#444',
  placeholder = '',
  rows = 3,
  disabled = false,
  value,
  onChange,
}) => {
  return (
    <div className='w-full space-y-2'>
      <Label style={{ color: labelColor }}>{label}</Label>
      <Textarea
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className='border border-blue-500/50 rounded-md focus:shadow-[0 0 5px rgba(0, 123, 255, 0.5)] placeholder:text-gray-500/50 text-gray-500'
      />
    </div>
  );
};

// Main component that decides which version to use
const TextareaField: FC<TextareaFieldProps> = props => {
  if (props.control && props.name) {
    return <ControlledTextareaField {...(props as any)} />;
  }
  return <UncontrolledTextareaField {...(props as any)} />;
};

export default TextareaField;
