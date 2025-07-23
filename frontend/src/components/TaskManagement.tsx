import React, { useState } from 'react';
import { Task, TaskUpdateRequest } from '../services/projectProgressAPI';

interface TaskManagementProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updateData: TaskUpdateRequest) => void;
  onAddTask?: () => void;
  onDeleteTask?: (taskId: string) => void;
  readonly?: boolean;
}

const TaskManagement: React.FC<TaskManagementProps> = ({
  tasks,
  onUpdateTask,
  onAddTask,
  onDeleteTask,
  readonly = false
}) => {
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [progressInput, setProgressInput] = useState<{ [key: string]: number }>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'เสร็จสิ้น';
      case 'IN_PROGRESS':
        return 'กำลังดำเนินการ';
      case 'ON_HOLD':
        return 'ระงับชั่วคราว';
      case 'CANCELLED':
        return 'ยกเลิก';
      default:
        return 'ยังไม่เริ่ม';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'วิกฤต';
      case 'HIGH':
        return 'สูง';
      case 'MEDIUM':
        return 'ปานกลาง';
      case 'LOW':
        return 'ต่ำ';
      default:
        return 'ไม่ระบุ';
    }
  };

  const handleProgressUpdate = (taskId: string) => {
    const progress = progressInput[taskId];
    if (progress !== undefined && progress >= 0 && progress <= 100) {
      onUpdateTask(taskId, {
        task_id: taskId,
        actual_completion_percentage: progress
      });
      setEditingTask(null);
      setProgressInput(prev => ({ ...prev, [taskId]: undefined }));
    }
  };

  const handleProgressChange = (taskId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setProgressInput(prev => ({ ...prev, [taskId]: numValue }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (task: Task) => {
    const startDate = new Date(task.planned_start_date);
    const endDate = new Date(task.planned_end_date);
    const today = new Date();
    
    if (today < startDate) return 0;
    if (today > endDate) return 100;
    
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.min(100, (elapsedDays / totalDays) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">การจัดการงาน (Tasks)</h3>
          {onAddTask && !readonly && (
            <button
              onClick={onAddTask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              เพิ่มงานใหม่
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                งาน
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่เริ่ม
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่สิ้นสุด
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                น้ำหนัก
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ความสำคัญ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ความก้าวหน้า
              </th>
              {!readonly && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.task_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {task.task_name}
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {task.description}
                      </div>
                    )}
                    {task.assigned_to && (
                      <div className="text-xs text-gray-400 mt-1">
                        มอบหมายให้: {task.assigned_to}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(task.planned_start_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(task.planned_end_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.planned_weight}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${getPriorityColor(task.priority)}`}
                    />
                    <span className="text-sm text-gray-900">
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>ความก้าวหน้า</span>
                        <span>{task.actual_completion_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.actual_completion_percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ตามแผน: {calculateProgress(task).toFixed(1)}%
                      </div>
                    </div>
                    {!readonly && editingTask === task.task_id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={progressInput[task.task_id] || ''}
                          onChange={(e) => handleProgressChange(task.task_id, e.target.value)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0-100"
                        />
                        <button
                          onClick={() => handleProgressUpdate(task.task_id)}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => {
                            setEditingTask(null);
                            setProgressInput(prev => ({ ...prev, [task.task_id]: undefined }));
                          }}
                          className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : !readonly ? (
                      <button
                        onClick={() => setEditingTask(task.task_id)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        แก้ไข
                      </button>
                    ) : null}
                  </div>
                </td>
                {!readonly && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {onDeleteTask && (
                        <button
                          onClick={() => onDeleteTask(task.task_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          <p>ไม่มีงานในโครงการนี้</p>
          {onAddTask && !readonly && (
            <button
              onClick={onAddTask}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              เพิ่มงานแรก
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskManagement; 