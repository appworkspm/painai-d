import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, Clock, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'timesheet' | 'project' | 'cost' | 'system' | 'team';
  actionUrl?: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const NotificationCenter: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [category, setCategory] = useState<string>('all');

  // ดึงข้อมูลการแจ้งเตือนจริงจาก API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: เปลี่ยนเป็น API จริงเมื่อพร้อม
        // const response = await fetch('/api/notifications');
        // const data = await response.json();
        // setNotifications(data);
        
        // ข้อมูลตัวอย่างสำหรับการพัฒนา
        const sampleNotifications: Notification[] = [
          {
            id: '1',
            type: 'warning',
            title: 'ไทม์ชีทรออนุมัติ',
            message: 'คุณมีไทม์ชีทที่รอการอนุมัติ',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            read: false,
            priority: 'high',
            category: 'timesheet',
            actionUrl: '/timesheets/pending'
          },
          {
            id: '2',
            type: 'success',
            title: 'อนุมัติคำขอต้นทุน',
            message: 'คำขอต้นทุนได้รับการอนุมัติแล้ว',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            read: false,
            priority: 'medium',
            category: 'cost',
            actionUrl: '/cost-requests'
          }
        ];
        setNotifications(sampleNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Apply read filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'urgent') {
      filtered = filtered.filter(n => n.priority === 'urgent');
    }

    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(n => n.category === category);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category: Notification['category']) => {
    switch (category) {
      case 'timesheet':
        return 'ไทม์ชีท';
      case 'project':
        return 'โครงการ';
      case 'cost':
        return 'ต้นทุน';
      case 'system':
        return 'ระบบ';
      case 'team':
        return 'ทีม';
      default:
        return category;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4 mr-2" />
        {t('dashboard.notifications')}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white border rounded-lg shadow-lg z-50">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">การแจ้งเตือน</CardTitle>
                <div className="flex items-center space-x-2">
                  {urgentCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {urgentCount} ฉุกเฉิน
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    อ่านทั้งหมด
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Filters */}
              <div className="px-4 pb-3 border-b">
                <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                    <TabsTrigger value="unread">ยังไม่อ่าน</TabsTrigger>
                    <TabsTrigger value="urgent">ฉุกเฉิน</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="mt-3">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="all">ทุกหมวดหมู่</option>
                    <option value="timesheet">ไทม์ชีท</option>
                    <option value="project">โครงการ</option>
                    <option value="cost">ต้นทุน</option>
                    <option value="system">ระบบ</option>
                    <option value="team">ทีม</option>
                  </select>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {getFilteredNotifications().length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>ไม่มีการแจ้งเตือน</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {getFilteredNotifications().map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {notification.sender ? (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={notification.sender.avatar} />
                                <AvatarFallback>
                                  {notification.sender.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                {getNotificationIcon(notification.type)}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getPriorityColor(notification.priority)}`}
                                  >
                                    {getCategoryLabel(notification.category)}
                                  </Badge>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center space-x-4">
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {format(notification.timestamp, 'd MMM HH:mm', { locale: th })}
                                  </span>
                                  {notification.actionUrl && (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="text-xs p-0 h-auto"
                                    >
                                      ดูรายละเอียด
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-1">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>ทั้งหมด {notifications.length} รายการ</span>
                  <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                    ดูทั้งหมด
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 