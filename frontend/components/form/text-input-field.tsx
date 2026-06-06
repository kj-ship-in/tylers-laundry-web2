'use client';
import React, { type FC } from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { useController, type Control } from 'react-hook-form';

import type { InputProps } from '@/types/input';

import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { FieldError } from '../ui/field';

// Controlled version using react-hook-form
const ControlledTextInputField: FC<
  InputProps &
    React.InputHTMLAttributes<HTMLInputElement> & { control: Control<any> }
> = ({
  name,
  control,
  label,
  labelColor = '#444',
  prefixIcon: Icon,
  placeholder,
  type,
  onChange,
  secureEntry,
  isPasswordVisible,
  togglePassword,
  error,
  ...props
}) => {
  const {
    field,
    fieldState: { error: fieldError },
  } = useController({
    name,
    control,
  });

  const displayError = error ?? fieldError?.message;

  return (
    <div className='w-full space-y-2'>
      <Label style={{ color: labelColor }}>{label}</Label>
      <div className='flex flex-row justify-start bg-transparent items-center border border-blue-500/50 rounded-md w-full'>
        {Icon && <Icon size={24} className=' text-gray-500 mx-2' />}
        <input
          {...field}
          {...props}
          className={`w-full bg-transparent text-gray-500 pr-2 placeholder:text-gray-500/50 py-1.5 border-none outline-none pl-1 focus:shadow-[0 0 5px rgba(0, 123, 255, 0.5)] placeholder:text-[13px] ${secureEntry ? 'rounded-r-0' : 'rounded-r-md'}`}
          placeholder={placeholder}
          type={isPasswordVisible ? 'text' : type}
          onChange={e => {
            field.onChange(e);
            if (onChange) {
              onChange(e);
            }
          }}
        />
        {secureEntry && (
          <Button
            type='button'
            variant='default'
            className='w-5 h-5 bg-transparent hover:bg-transparent mr-2 px-1 shadow-none'
            onClick={togglePassword}
          >
            {isPasswordVisible ? (
              <EyeOff size={22} className='text-gray-500' />
            ) : (
              <Eye size={22} className='text-gray-500' />
            )}
          </Button>
        )}
      </div>
      {displayError && (
        <FieldError className='text-sm text-red-500'>{displayError}</FieldError>
      )}
    </div>
  );
};

// Uncontrolled version for plain inputs
const UncontrolledTextInputField: FC<
  Omit<InputProps, 'control' | 'name'> &
    React.InputHTMLAttributes<HTMLInputElement>
> = ({
  label,
  labelColor = '#444',
  prefixIcon: Icon,
  placeholder,
  type,
  onChange,
  secureEntry,
  isPasswordVisible,
  togglePassword,
  error,
  ...props
}) => {
  return (
    <div className='w-full space-y-2'>
      <Label style={{ color: labelColor }}>{label}</Label>
      <div className='flex flex-row justify-start bg-transparent items-center border border-blue-500/50 rounded-md w-full'>
        {Icon && <Icon size={24} className=' text-gray-500 mx-2' />}
        <input
          {...props}
          className={`w-full bg-transparent text-gray-500 pr-2 placeholder:text-gray-500/50 py-1.5 border-none outline-none pl-1 focus:shadow-[0 0 5px rgba(0, 123, 255, 0.5)] placeholder:text-[13px] ${secureEntry ? 'rounded-r-0' : 'rounded-r-md'}`}
          placeholder={placeholder}
          type={isPasswordVisible ? 'text' : type}
          onChange={onChange}
        />
        {secureEntry && (
          <Button
            type='button'
            variant='default'
            className='w-5 h-5 bg-transparent hover:bg-transparent mr-2 px-1 shadow-none'
            onClick={togglePassword}
          >
            {isPasswordVisible ? (
              <EyeOff size={22} className='text-gray-500' />
            ) : (
              <Eye size={22} className='text-gray-500' />
            )}
          </Button>
        )}
      </div>
      {error && (
        <FieldError className='text-sm text-red-500'>{error}</FieldError>
      )}
    </div>
  );
};

// Main component that decides which version to use
const TextInputField: FC<
  InputProps & React.InputHTMLAttributes<HTMLInputElement>
> = props => {
  if (props.control) {
    return <ControlledTextInputField {...(props as any)} />;
  }
  return <UncontrolledTextInputField {...(props as any)} />;
};

export default TextInputField;
