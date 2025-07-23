import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { th } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'timesheet' | 'meeting' | 'deadline' | 'holiday';
  description?: string;
  location?: string;
  attendees?: string[];
}

interface CalendarWidgetProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
  showEvents?: boolean;
  compact?: boolean;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  events = [],
  onDateSelect,
  onEventClick,
  className = '',
  showEvents = true,
  compact = false
}) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'timesheet':
        return 'bg-blue-500';
      case 'meeting':
        return 'bg-green-500';
      case 'deadline':
        return 'bg-red-500';
      case 'holiday':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'timesheet':
        return <Clock className="w-3 h-3" />;
      case 'meeting':
        return <Users className="w-3 h-3" />;
      case 'deadline':
        return <Calendar className="w-3 h-3" />;
      case 'holiday':
        return <MapPin className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy', { locale: th })}
          </h3>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            {t('calendar.today')}
          </button>
        </div>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <button
                key={day.toString()}
                onClick={() => handleDateClick(day)}
                className={`
                  relative min-h-[60px] p-2 text-left rounded-lg transition-all
                  ${isCurrentMonth ? 'hover:bg-gray-50' : 'text-gray-400'}
                  ${isSelected ? 'bg-blue-100 border-2 border-blue-500' : ''}
                  ${isCurrentDay ? 'bg-blue-50 font-semibold' : ''}
                  ${compact ? 'min-h-[40px] text-sm' : ''}
                `}
              >
                <span className={`block ${isCurrentDay ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </span>
                
                {/* Event Indicators */}
                {showEvents && dayEvents.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, compact ? 1 : 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        className={`
                          flex items-center gap-1 p-1 rounded text-xs text-white cursor-pointer
                          ${getEventTypeColor(event.type)}
                          hover:opacity-80 transition-opacity
                        `}
                      >
                        {getEventTypeIcon(event.type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > (compact ? 1 : 2) && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - (compact ? 1 : 2)} {t('calendar.more')}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Legend */}
      {showEvents && (
        <div className="p-4 border-t bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {t('calendar.legend')}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>{t('calendar.timesheet')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>{t('calendar.meeting')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>{t('calendar.deadline')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>{t('calendar.holiday')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile Calendar Component
export const MobileCalendar: React.FC<CalendarWidgetProps> = (props) => {
  return (
    <div className="md:hidden">
      <CalendarWidget {...props} compact={true} />
    </div>
  );
};

// Desktop Calendar Component
export const DesktopCalendar: React.FC<CalendarWidgetProps> = (props) => {
  return (
    <div className="hidden md:block">
      <CalendarWidget {...props} />
    </div>
  );
}; 