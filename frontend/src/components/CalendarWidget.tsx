import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { th } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: 'meeting' | 'deadline' | 'reminder' | 'holiday' | 'project';
  priority: 'low' | 'medium' | 'high';
  attendees?: string[];
  location?: string;
  projectId?: string;
  projectName?: string;
}

const CalendarWidget: React.FC = () => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  // Mock events data
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'ประชุมทีมประจำสัปดาห์',
        description: 'ประชุมทบทวนความคืบหน้าโครงการ',
        startTime: new Date(2024, 0, 15, 14, 0), // 15 Jan 2024, 2 PM
        endTime: new Date(2024, 0, 15, 15, 30), // 15 Jan 2024, 3:30 PM
        type: 'meeting',
        priority: 'high',
        attendees: ['John Doe', 'Jane Smith', 'Mike Johnson'],
        location: 'ห้องประชุม A'
      },
      {
        id: '2',
        title: 'ส่งรายงานโครงการ ABC',
        description: 'รายงานความคืบหน้าประจำเดือน',
        startTime: new Date(2024, 0, 20, 17, 0), // 20 Jan 2024, 5 PM
        endTime: new Date(2024, 0, 20, 17, 0), // Same time for deadline
        type: 'deadline',
        priority: 'high',
        projectId: 'proj-001',
        projectName: 'โครงการ ABC'
      },
      {
        id: '3',
        title: 'วันหยุดราชการ',
        description: 'วันเด็กแห่งชาติ',
        startTime: new Date(2024, 0, 13, 0, 0), // 13 Jan 2024
        endTime: new Date(2024, 0, 13, 23, 59), // 13 Jan 2024
        type: 'holiday',
        priority: 'low'
      },
      {
        id: '4',
        title: 'ตรวจสอบไทม์ชีท',
        description: 'ตรวจสอบและอนุมัติไทม์ชีทของทีม',
        startTime: new Date(2024, 0, 18, 9, 0), // 18 Jan 2024, 9 AM
        endTime: new Date(2024, 0, 18, 10, 0), // 18 Jan 2024, 10 AM
        type: 'reminder',
        priority: 'medium'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.startTime, date));
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'holiday':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'project':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-3 w-3" />;
      case 'deadline':
        return <Clock className="h-3 w-3" />;
      case 'reminder':
        return <Clock className="h-3 w-3" />;
      case 'holiday':
        return <Calendar className="h-3 w-3" />;
      case 'project':
        return <Calendar className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-red-500';
      case 'medium':
        return 'border-l-4 border-l-yellow-500';
      case 'low':
        return 'border-l-4 border-l-green-500';
      default:
        return '';
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const todayEvents = getEventsForDate(new Date());

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: th })}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            เดือน
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            สัปดาห์
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
          >
            วัน
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
                    ${isSelected ? 'bg-blue-50 border-blue-300' : ''}
                    ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                    hover:bg-gray-50
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`
                          text-xs p-1 rounded border ${getEventTypeColor(event.type)}
                          ${getPriorityColor(event.priority)}
                        `}
                        title={event.title}
                      >
                        <div className="flex items-center space-x-1">
                          {getEventTypeIcon(event.type)}
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 2} อื่นๆ
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">กิจกรรมวันนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`
                    p-3 rounded-lg border ${getEventTypeColor(event.type)}
                    ${getPriorityColor(event.priority)}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getEventTypeIcon(event.type)}
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {event.type === 'meeting' ? 'ประชุม' :
                           event.type === 'deadline' ? 'กำหนดส่ง' :
                           event.type === 'reminder' ? 'เตือน' :
                           event.type === 'holiday' ? 'วันหยุด' : 'โครงการ'}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(event.startTime, 'HH:mm')}
                          {event.endTime && event.endTime !== event.startTime && 
                            ` - ${format(event.endTime, 'HH:mm')}`
                          }
                        </span>
                        {event.location && (
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </span>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {event.attendees.length} คน
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มกิจกรรม
        </Button>
        <Button variant="outline" size="sm">
          ซิงค์ปฏิทิน
        </Button>
      </div>
    </div>
  );
};

export default CalendarWidget; 