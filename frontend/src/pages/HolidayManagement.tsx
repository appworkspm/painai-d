import React, { useEffect, useState } from 'react';
import { holidaysAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { Calendar, Plus, Trash2, Save, X } from 'lucide-react';

interface Holiday {
  id: string;
  date: string;
  name: string;
  nameEn?: string;
  type?: string;
  description?: string;
}

const HolidayManagement: React.FC = () => {
  const { showNotification } = useNotification();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [form, setForm] = useState({ date: '', name: '', nameEn: '', type: '', description: '' });

  const loadHolidays = async () => {
    setLoading(true);
    try {
      const res = await holidaysAPI.getHolidays();
      if (res.success) setHolidays(res.data);
    } catch (err) {
      showNotification({ message: 'Failed to load holidays', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHolidays(); }, []);

  const openCreate = () => { setEditingHoliday(null); setForm({ date: '', name: '', nameEn: '', type: '', description: '' }); setShowModal(true); };
  const openEdit = (h: Holiday) => {
    setEditingHoliday(h);
    setForm({ date: h.date.split('T')[0], name: h.name, nameEn: h.nameEn || '', type: h.type || '', description: h.description || '' });
    setShowModal(true);
  };

  const submitForm = async () => {
    try {
      if (editingHoliday) {
        await holidaysAPI.updateHoliday(editingHoliday.id, form);
        showNotification({ message: 'Holiday updated', type: 'success' });
      } else {
        await holidaysAPI.createHoliday(form);
        showNotification({ message: 'Holiday created', type: 'success' });
      }
      setShowModal(false);
      loadHolidays();
    } catch (err) {
      showNotification({ message: 'Save failed', type: 'error' });
    }
  };

  const deleteHoliday = async (id: string) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await holidaysAPI.deleteHoliday(id);
      showNotification({ message: 'Holiday deleted', type: 'success' });
      loadHolidays();
    } catch {
      showNotification({ message: 'Delete failed', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Holiday Management</h1>
        </div>
        <button onClick={openCreate} className="bg-primary-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-primary-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Holiday
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : holidays.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No holidays</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name (TH)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name (EN)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holidays.map(h => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button onClick={() => openEdit(h)} className="text-primary-600 hover:text-primary-900 text-sm">Edit</button>
                      <button onClick={() => deleteHoliday(h.id)} className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{h.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{h.nameEn}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{h.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</h2>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="w-full border px-3 py-2 rounded"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (TH)</label>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border px-3 py-2 rounded"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (EN)</label>
                <input value={form.nameEn} onChange={e=>setForm({...form,nameEn:e.target.value})} className="w-full border px-3 py-2 rounded"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full border px-3 py-2 rounded"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full border px-3 py-2 rounded" rows={3}/>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 border rounded text-gray-700 flex items-center"><X className="h-4 w-4 mr-1"/>Cancel</button>
              <button onClick={submitForm} className="px-4 py-2 bg-primary-600 text-white rounded flex items-center hover:bg-primary-700"><Save className="h-4 w-4 mr-1"/>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayManagement;