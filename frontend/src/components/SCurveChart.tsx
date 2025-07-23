import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/badge';
import { SCurveData } from '../services/projectProgressAPI';

interface SCurveChartProps {
  data: SCurveData[];
  title?: string;
  height?: number;
  showArea?: boolean;
  showBars?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {new Date(label).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center gap-4 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ON_TRACK':
      return '#10B981';
    case 'BEHIND_SCHEDULE':
      return '#F59E0B';
    case 'AHEAD_OF_SCHEDULE':
      return '#3B82F6';
    case 'COMPLETED':
      return '#8B5CF6';
    case 'ON_HOLD':
      return '#EF4444';
    default:
      return '#6B7280';
  }
};

const getStatusBadge = (status: string) => {
  const statusMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
    'ON_TRACK': { label: 'ตามแผน', variant: 'default' },
    'BEHIND_SCHEDULE': { label: 'ล่าช้า', variant: 'destructive' },
    'AHEAD_OF_SCHEDULE': { label: 'เร็วกว่าแผน', variant: 'secondary' },
    'COMPLETED': { label: 'เสร็จสิ้น', variant: 'outline' },
    'ON_HOLD': { label: 'ระงับ', variant: 'destructive' }
  };

  const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
};

export const SCurveChart: React.FC<SCurveChartProps> = ({
  data,
  title = 'S-Curve Progress Chart',
  height = 400,
  showArea = true,
  showBars = false,
  showGrid = true,
  showLegend = true,
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>ไม่มีข้อมูลความก้าวหน้า</p>
              <p className="text-sm">กรุณาเพิ่มข้อมูลความก้าวหน้าเพื่อแสดงกราฟ</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric'
    }),
    fullDate: item.date
  }));

  const latestData = data[data.length - 1];
  const progressVariance = latestData ? latestData.actual - latestData.planned : 0;

  return (
    <Card className={`${className} shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              แสดงความก้าวหน้าแบบ S-Curve เปรียบเทียบแผนกับผลงานจริง
            </p>
          </div>
          {latestData && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">ความก้าวหน้าล่าสุด</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {latestData.actual.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">เป้าหมาย</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {latestData.planned.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">ความแตกต่าง</p>
                <p className={`text-lg font-bold ${progressVariance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {progressVariance >= 0 ? '+' : ''}{progressVariance.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Status Summary */}
          {latestData && (
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">สถานะ:</span>
                {getStatusBadge(latestData.status)}
              </div>
              {latestData.milestone && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Milestone:</span>
                  <Badge variant="outline">{latestData.milestone}</Badge>
                </div>
              )}
            </div>
          )}

          {/* Chart */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={height}>
              {showBars ? (
                <ComposedChart data={chartData}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {showLegend && <Legend content={<CustomLegend />} />}
                  
                  {showArea && (
                    <Area
                      type="monotone"
                      dataKey="planned"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="แผน (Planned)"
                    />
                  )}
                  
                  <Bar
                    dataKey="actual"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    name="ผลงานจริง (Actual)"
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="planned"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                    name="แผน (Planned)"
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                    name="ผลงานจริง (Actual)"
                  />
                </ComposedChart>
              ) : showArea ? (
                <AreaChart data={chartData}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {showLegend && <Legend content={<CustomLegend />} />}
                  
                  <Area
                    type="monotone"
                    dataKey="planned"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    name="แผน (Planned)"
                  />
                  
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    name="ผลงานจริง (Actual)"
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {showLegend && <Legend content={<CustomLegend />} />}
                  
                  <Line
                    type="monotone"
                    dataKey="planned"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                    name="แผน (Planned)"
                  />
                  
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                    name="ผลงานจริง (Actual)"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">แผน</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">ผลงานจริง</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ข้อมูลล่าสุด: {latestData ? new Date(latestData.date).toLocaleDateString('th-TH') : 'ไม่มีข้อมูล'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 