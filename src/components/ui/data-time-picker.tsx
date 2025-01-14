'use client'

import { CalendarIcon } from 'lucide-react';
import { format, isSameDay, isValid } from 'date-fns';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
  name: string;
  label?: string;
  required?: boolean;
  minDate?: Date;
}

type TimeComponents = {
  hours: number;
  minutes: number;
};

export default function DateTimePicker({ 
  name, 
  label,
  required = true,
  minDate,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useFormContext();
  const fieldValue = form.watch(name) as Date | undefined;
  const [time, setTime] = useState(() => {
    if (fieldValue && isValid(fieldValue)) {
      return `${fieldValue.getHours().toString().padStart(2, '0')}:${fieldValue.getMinutes().toString().padStart(2, '0')}`;
    }
    return "05:00";
  });
  const [date, setDate] = useState<Date | null>(() => {
    return fieldValue && isValid(fieldValue) ? fieldValue : null;
  });

  const parseTimeString = (timeString: string): TimeComponents => {
    try {
      const [hours = '0', minutes = '0'] = timeString.split(':');
      return {
        hours: Math.min(23, Math.max(0, Number.parseInt(hours, 10) || 0)),
        minutes: Math.min(59, Math.max(0, Number.parseInt(minutes, 10) || 0)),
      };
    } catch {
      return { hours: 0, minutes: 0 };
    }
  };

  const isTimeDisabled = (timeString: string): boolean => {
    if (!minDate || !date) return false;
    
    if (isSameDay(date, minDate)) {
      const { hours, minutes } = parseTimeString(timeString);
      const minTime = minDate.getHours() * 60 + minDate.getMinutes();
      const currentTime = hours * 60 + minutes;
      return currentTime < minTime;
    }
    return false;
  };

  const getInitialValidTime = (): string => {
    if (!minDate) return "05:00";
    
    const hours = minDate.getHours().toString().padStart(2, '0');
    const minutes = Math.ceil(minDate.getMinutes() / 15) * 15;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (fieldValue && isValid(fieldValue)) {
      const newTime = `${fieldValue.getHours().toString().padStart(2, '0')}:${fieldValue.getMinutes().toString().padStart(2, '0')}`;
      setTime(newTime);
      setDate(fieldValue);
    }
  }, [fieldValue]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    try {
      if (selectedDate && isValid(selectedDate)) {
        const newTime = isSameDay(selectedDate, minDate!) ? getInitialValidTime() : time;
        const { hours, minutes } = parseTimeString(newTime);
        const newDateTime = new Date(selectedDate);
        newDateTime.setHours(hours, minutes);
        
        if (isValid(newDateTime)) {
          setDate(newDateTime);
          setTime(newTime);
          form.setValue(name, newDateTime, { shouldValidate: true });
        }
      } else if (!required) {
        setDate(null);
        form.setValue(name, null, { shouldValidate: true });
      }
    } catch (error) {
      console.error('Error handling date select:', error);
    }
  };

  const handleTimeChange = (newTime: string) => {
    try {
      setTime(newTime);
      if (date || fieldValue) {
        const { hours, minutes } = parseTimeString(newTime);
        const baseDate = date ?? fieldValue;
        if (baseDate && isValid(baseDate)) {
          const newDateTime = new Date(baseDate.getTime());
          newDateTime.setHours(hours, minutes);
          
          if (isValid(newDateTime)) {
            setDate(newDateTime);
            form.setValue(name, newDateTime, { shouldValidate: true });
          }
        }
      }
    } catch (error) {
      console.error('Error handling time change:', error);
    }
  };

  return (
    <div className="flex w-full gap-4">
      <FormField
        control={form.control}
        name={name}
        render={({ field: { value } }) => {
          const getDefaultMonth = (): Date => {
            if (value && isValid(value as Date)) {
              return value as Date;
            }
            return new Date();
          };

          return(
            <FormItem className="flex flex-col w-full">
              {label && <FormLabel>{label}</FormLabel>}
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full font-normal",
                        !value && "text-muted-foreground"
                      )}
                      type='button'
                    >
                      {value && isValid(value as Date) ? (
                        `${format(value, "PPP")}, ${time}`
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={date ?? (value as Date)}
                    onSelect={handleDateSelect}
                    onDayClick={() => setIsOpen(false)}
                    fromYear={2000}
                    toYear={new Date().getFullYear() + 10}
                    defaultMonth={getDefaultMonth()}
                    disabled={(date) => {
                      if (minDate) {
                        return date < new Date(minDate.setHours(0, 0, 0, 0));
                      }
                      return false;
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )
        }}
      />
      <FormField
        control={form.control}
        name={name}
        render={() => (
          <FormItem className="flex flex-col">
            <FormLabel>Time</FormLabel>
            <FormControl>
              <Select
                value={time}
                onValueChange={handleTimeChange}
              >
                <SelectTrigger className="font-normal focus:ring-0 w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[15rem]">
                    {Array.from({ length: 96 }).map((_, i) => {
                      const hour = Math.floor(i / 4)
                        .toString()
                        .padStart(2, "0");
                      const minute = ((i % 4) * 15)
                        .toString()
                        .padStart(2, "0");
                      const timeString = `${hour}:${minute}`;
                      
                      return (
                        <SelectItem 
                          key={i} 
                          value={timeString}
                          disabled={isTimeDisabled(timeString)}
                          className={cn(
                            isTimeDisabled(timeString) && "text-muted-foreground cursor-not-allowed"
                          )}
                        >
                          {timeString}
                        </SelectItem>
                      );
                    })}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}