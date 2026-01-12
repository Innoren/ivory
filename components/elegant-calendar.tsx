'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ElegantCalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ElegantCalendar({ selected, onSelect, disabled, className }: ElegantCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Generate calendar days
  const calendarDays = [];
  
  // Previous month's trailing days
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = prevMonth.getDate() - i;
    calendarDays.push({
      date: new Date(year, month - 1, day),
      isCurrentMonth: false,
      day
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
      day
    });
  }
  
  // Next month's leading days
  const remainingDays = 42 - calendarDays.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
      day
    });
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  const isSelected = (date: Date) => {
    if (!selected) return false;
    return date.toDateString() === selected.toDateString();
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const isDisabled = (date: Date) => {
    return disabled ? disabled(date) : false;
  };
  
  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-[#E8E8E8]/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E8E8]/30">
        <button
          onClick={() => navigateMonth('prev')}
          className="h-10 w-10 flex items-center justify-center hover:bg-[#F8F7F5] rounded-full transition-all duration-300 active:scale-90 group"
        >
          <ChevronLeft className="h-5 w-5 text-[#8B7355] group-hover:text-[#1A1A1A] transition-colors duration-300" strokeWidth={1.5} />
        </button>
        
        <h2 className="font-serif text-xl text-[#1A1A1A] font-light tracking-tight">
          {MONTHS[month]} {year}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="h-10 w-10 flex items-center justify-center hover:bg-[#F8F7F5] rounded-full transition-all duration-300 active:scale-90 group"
        >
          <ChevronRight className="h-5 w-5 text-[#8B7355] group-hover:text-[#1A1A1A] transition-colors duration-300" strokeWidth={1.5} />
        </button>
      </div>
      
      <div className="p-6">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {DAYS.map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-[11px] tracking-[0.15em] uppercase text-[#6B6B6B] font-light"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((calendarDay, index) => {
            const { date, isCurrentMonth, day } = calendarDay;
            const selected = isSelected(date);
            const today = isToday(date);
            const disabled = isDisabled(date);
            
            return (
              <button
                key={index}
                onClick={() => {
                  if (!disabled && isCurrentMonth && onSelect) {
                    onSelect(date);
                  }
                }}
                disabled={disabled || !isCurrentMonth}
                className={cn(
                  "h-12 w-full flex items-center justify-center text-[14px] font-light rounded-xl transition-all duration-300 relative group",
                  // Base styles
                  isCurrentMonth 
                    ? "text-[#1A1A1A] hover:bg-[#F8F7F5]" 
                    : "text-[#E8E8E8] cursor-default",
                  // Selected state - elegant gold accent
                  selected && "bg-[#8B7355] text-white hover:bg-[#8B7355] shadow-lg shadow-[#8B7355]/20 scale-105",
                  // Today indicator - subtle highlight
                  today && !selected && "bg-[#F8F7F5] font-medium ring-1 ring-[#8B7355]/20",
                  // Disabled state
                  disabled && "opacity-30 cursor-not-allowed hover:bg-transparent",
                  // Active state
                  !disabled && isCurrentMonth && "active:scale-95 hover:scale-105",
                  // Available dates get subtle hover effect
                  !disabled && isCurrentMonth && !selected && "hover:shadow-md hover:shadow-[#8B7355]/10"
                )}
              >
                <span className={cn(
                  "transition-all duration-300",
                  selected && "font-medium"
                )}>
                  {day}
                </span>
                
                {/* Today dot indicator */}
                {today && !selected && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#8B7355] rounded-full opacity-60" />
                )}
                
                {/* Subtle hover ring for available dates */}
                {!disabled && isCurrentMonth && !selected && (
                  <div className="absolute inset-0 rounded-xl ring-1 ring-[#8B7355]/0 group-hover:ring-[#8B7355]/20 transition-all duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}