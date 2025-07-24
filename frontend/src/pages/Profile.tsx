import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  User as UserIcon, 
  Save, 
  Shield, 
  Calendar, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Phone,
  MapPin,
  Building,
  Clock,
  Activity,
  Settings,
  Bell,
  Key,
  Briefcase,
  Award,
  TrendingUp,
  FileText,
  DollarSign,
  Target,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { usersAPI, timesheetAPI, projectAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  
  // Debug logging
  console.log('Profile component - User data:', user);
  console.log('Profile component - User role:', user?.role);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalHours: 0,
    totalProjects: 0,
    completedTasks: 0,
    pendingApprovals: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user?.position || '',
    department: user?.department || '',
    employeeCode: user?.employeeCode || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      timesheetReminders: true,
      projectUpdates: true,
      approvalNotifications: true
    }
  });

  useEffect(() => {
    loadUserStats();
    loadRecentActivity();
  }, []);

  const loadUserStats = async () => {
    try {
      const [timesheetsRes, projectsRes] = await Promise.all([
        timesheetAPI.getMyTimesheets(),
        projectAPI.getProjects()
      ]);

      const totalHours = timesheetsRes.data?.reduce((sum: number, ts: any) => sum + (ts.hours_worked || 0), 0) || 0;
      const totalProjects = projectsRes.data?.length || 0;
      const completedTasks = timesheetsRes.data?.filter((ts: any) => ts.status === 'approved').length || 0;
      const pendingApprovals = timesheetsRes.data?.filter((ts: any) => ts.status === 'submitted').length || 0;

      setStats({
        totalHours,
        totalProjects,
        completedTasks,
        pendingApprovals
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const timesheetsRes = await timesheetAPI.getMyTimesheets();
      const recent = timesheetsRes.data?.slice(0, 5).map((ts: any) => ({
        id: ts.id,
        type: 'timesheet',
        action: ts.status === 'approved' ? 'อนุมัติแล้ว' : ts.status === 'submitted' ? 'ส่งแล้ว' : 'บันทึกแล้ว',
        description: `${ts.project?.name || 'ไม่มีโครงการ'} - ${ts.hours_worked} ชั่วโมง`,
        date: new Date(ts.created_at),
        status: ts.status
      })) || [];
      setRecentActivity(recent);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords if changing password
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          showNotification({
            message: t('profile.error.current_password_required'),
            type: 'error'
          });
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          showNotification({
            message: t('profile.error.passwords_do_not_match'),
            type: 'error'
          });
          return;
        }
        if (formData.newPassword.length < 6) {
          showNotification({
            message: t('profile.error.password_min_length'),
            type: 'error'
          });
          return;
        }
      }

      const updateData: any = { 
        name: formData.name,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        employeeCode: formData.employeeCode,
        address: formData.address,
        notificationSettings: formData.notificationSettings
      };
      
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await usersAPI.updateProfile(updateData);
      if (response.data) {
        setUser(response.data);
        setIsEditing(false);
        setFormData(prev => ({ 
          ...prev, 
          currentPassword: '', 
          newPassword: '', 
          confirmPassword: '' 
        }));
        showNotification({
          message: t('profile.success.update'),
          type: 'success'
        });
      }
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.message || t('profile.error.update_failed'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-yellow-100 text-yellow-800';
      case 'VP':
        return 'bg-purple-100 text-purple-800';
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex items-center mb-8">
        <UserIcon className="h-10 w-10 text-blue-600 mr-4" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="text-gray-600">จัดการข้อมูลส่วนตัวและการตั้งค่า</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                ข้อมูลส่วนตัว
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">ข้อมูลส่วนตัว</TabsTrigger>
                  <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
                  <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => handleInputChange('name', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={e => handleInputChange('phone', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
                        <input
                          type="text"
                          value={formData.position}
                          onChange={e => handleInputChange('position', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">แผนก</label>
                        <input
                          type="text"
                          value={formData.department}
                          onChange={e => handleInputChange('department', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">รหัสพนักงาน</label>
                        <input
                          type="text"
                          value={formData.employeeCode}
                          onChange={e => handleInputChange('employeeCode', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                      <textarea
                        value={formData.address}
                        onChange={e => handleInputChange('address', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!isEditing}
                      />
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800">เปลี่ยนรหัสผ่าน</h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            กรุณากรอกรหัสผ่านปัจจุบันก่อนเปลี่ยนรหัสผ่านใหม่
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านปัจจุบัน</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.currentPassword}
                            onChange={e => handleInputChange('currentPassword', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={!isEditing}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.newPassword}
                            onChange={e => handleInputChange('newPassword', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={!isEditing}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={e => handleInputChange('confirmPassword', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={!isEditing}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">การแจ้งเตือนทางอีเมล</h3>
                          <p className="text-sm text-gray-500">รับการแจ้งเตือนผ่านอีเมล</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notificationSettings.emailNotifications}
                        onChange={e => handleInputChange('notificationSettings.emailNotifications', e.target.checked)}
                        disabled={!isEditing}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">การแจ้งเตือนแบบพุช</h3>
                          <p className="text-sm text-gray-500">รับการแจ้งเตือนแบบพุชในเบราว์เซอร์</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notificationSettings.pushNotifications}
                        onChange={e => handleInputChange('notificationSettings.pushNotifications', e.target.checked)}
                        disabled={!isEditing}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">เตือนไทม์ชีท</h3>
                          <p className="text-sm text-gray-500">เตือนการบันทึกไทม์ชีทประจำวัน</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notificationSettings.timesheetReminders}
                        onChange={e => handleInputChange('notificationSettings.timesheetReminders', e.target.checked)}
                        disabled={!isEditing}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <Target className="h-5 w-5 text-purple-600 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">อัปเดตโครงการ</h3>
                          <p className="text-sm text-gray-500">แจ้งเตือนเมื่อมีการอัปเดตโครงการ</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notificationSettings.projectUpdates}
                        onChange={e => handleInputChange('notificationSettings.projectUpdates', e.target.checked)}
                        disabled={!isEditing}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">การอนุมัติ</h3>
                          <p className="text-sm text-gray-500">แจ้งเตือนเมื่อมีการอนุมัติหรือปฏิเสธ</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notificationSettings.approvalNotifications}
                        onChange={e => handleInputChange('notificationSettings.approvalNotifications', e.target.checked)}
                        disabled={!isEditing}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 mt-6 pt-6 border-t">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      บันทึกการเปลี่ยนแปลง
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      ยกเลิก
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    แก้ไขข้อมูล
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                ข้อมูลผู้ใช้
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ตำแหน่ง:</span>
                  <span className="text-sm font-medium">{user?.position || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">แผนก:</span>
                  <span className="text-sm font-medium">{user?.department || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">รหัสพนักงาน:</span>
                  <span className="text-sm font-medium">{user?.employeeCode || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">บทบาท:</span>
                  <Badge className={getRoleColor(user?.role || '')}>
                    {user?.role || 'ไม่ระบุ'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">สถานะ:</span>
                  <Badge className={getStatusColor(user?.isActive || false)}>
                    {user?.isActive ? 'ใช้งาน' : 'ระงับการใช้งาน'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                สถิติการทำงาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalHours}</div>
                  <div className="text-sm text-gray-600">ชั่วโมงรวม</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.totalProjects}</div>
                  <div className="text-sm text-gray-600">โครงการ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.completedTasks}</div>
                  <div className="text-sm text-gray-600">งานเสร็จ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</div>
                  <div className="text-sm text-gray-600">รออนุมัติ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                กิจกรรมล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      {getStatusIcon(activity.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400">
                          {activity.date.toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">ไม่มีกิจกรรมล่าสุด</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile; 