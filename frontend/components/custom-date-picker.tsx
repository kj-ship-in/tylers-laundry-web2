'use client';
import type { FC } from 'react';
import { useState } from 'react';

import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { Control, FieldValues } from 'react-hook-form';

type DatePickerInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  dateFormat?: string;
  disabled?: boolean;
  control?: Control<FieldValues | any>;
};

const DatePickerInput: FC<DatePickerInputProps> = ({
  name,
  control,
  placeholder = 'Pick a date',
  label,
  dateFormat = 'yyyy-MM-dd',
  disabled = false,
}) => {
  const now = new Date();
  const [hour, setHour] = useState(String(now.getHours()).padStart(2, '0'));
  const [minute, setMinute] = useState(
    String(now.getMinutes()).padStart(2, '0'),
  );
  const [second, setSecond] = useState(
    String(now.getSeconds()).padStart(2, '0'),
  );
  const hasTimeFormat =
    dateFormat.includes('HH') ||
    dateFormat.includes('mm') ||
    dateFormat.includes('ss');

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex flex-col mt-2'>
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger disabled={disabled} asChild>
              <FormControl>
                <Button
                  variant='outline'
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value ?? <span>{placeholder}</span>}
                  <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-4' align='start'>
              <div className='space-y-4'>
                <Calendar
                  mode='single'
                  selected={
                    field.value
                      ? parse(field.value, dateFormat, new Date())
                      : undefined
                  }
                  onSelect={(date: Date | undefined) => {
                    if (date && hasTimeFormat) {
                      const dateWithTime = format(
                        new Date(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDate(),
                          parseInt(hour),
                          parseInt(minute),
                          parseInt(second),
                        ),
                        dateFormat,
                      );
                      field.onChange(dateWithTime);
                    } else if (date) {
                      field.onChange(format(date, dateFormat));
                    }
                  }}
                  autoFocus
                />
                {hasTimeFormat && (
                  <div className='border-t pt-4 space-y-2'>
                    <p className='text-sm font-medium'>Time</p>
                    <div className='flex gap-2 items-center'>
                      <div className='flex flex-col'>
                        <label className='text-xs text-gray-600'>Hour</label>
                        <Input
                          type='number'
                          min='0'
                          max='23'
                          value={hour}
                          onChange={e =>
                            setHour(e.target.value.padStart(2, '0'))
                          }
                          className='w-16'
                        />
                      </div>
                      <span className='text-gray-600'>:</span>
                      <div className='flex flex-col'>
                        <label className='text-xs text-gray-600'>Minute</label>
                        <Input
                          type='number'
                          min='0'
                          max='59'
                          value={minute}
                          onChange={e =>
                            setMinute(e.target.value.padStart(2, '0'))
                          }
                          className='w-16'
                        />
                      </div>
                      <span className='text-gray-600'>:</span>
                      <div className='flex flex-col'>
                        <label className='text-xs text-gray-600'>Second</label>
                        <Input
                          type='number'
                          min='0'
                          max='59'
                          value={second}
                          onChange={e =>
                            setSecond(e.target.value.padStart(2, '0'))
                          }
                          className='w-16'
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DatePickerInput;
