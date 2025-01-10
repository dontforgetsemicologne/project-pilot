'use client'

import { CalendarIcon } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
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
import { useState } from "react";
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
  const [time, setTime] = useState<string>("05:00");
  const [date, setDate] = useState<Date | null>(null);
  const form = useFormContext();

  const parseTimeString = (timeString: string): TimeComponents => {
    const parts = timeString.split(':');
    const hoursStr = parts[0] ?? '0';
    const minutesStr = parts[1] ?? '0';
    return {
      hours: Number.parseInt(hoursStr, 10),
      minutes: Number.parseInt(minutesStr, 10),
    };
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

  return (
    <div className="flex w-full gap-4">
      <FormField
        control={form.control}
        name={name}
        render={({ field: { value, onChange } }) => (
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
                    {value ? (
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
                  selected={date ?? value}
                  onSelect={(selectedDate: Date | undefined) => {
                    if (selectedDate) {
                      const newTime = isSameDay(selectedDate, minDate!) ? getInitialValidTime() : time;
                      const { hours, minutes } = parseTimeString(newTime);
                      selectedDate.setHours(hours, minutes);
                      setDate(selectedDate);
                      setTime(newTime);
                      onChange(selectedDate);
                    } else if (!required) {
                      setDate(null);
                      onChange(null);
                    }
                  }}
                  onDayClick={() => setIsOpen(false)}
                  fromYear={2000}
                  toYear={new Date().getFullYear() + 10}
                  defaultMonth={value as Date}
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
        )}
      />
      <FormField
        control={form.control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Time</FormLabel>
            <FormControl>
              <Select
                value={time}
                onValueChange={(newTime: string) => {
                  setTime(newTime);
                  if (date || value) {
                    const { hours, minutes } = parseTimeString(newTime);
                    const newDate = new Date(date?.getTime() ?? (value as Date).getTime());
                    newDate.setHours(hours, minutes);
                    setDate(newDate);
                    onChange(newDate);
                  }
                }}
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