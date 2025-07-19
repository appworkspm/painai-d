import { useState, useEffect, useCallback } from 'react';
import { timesheetTypesAPI } from '../services/api';

export interface WorkType {
  id: string;
  name: string;
  description: string;
}

export interface SubWorkType extends WorkType {
  workTypeId: string;
}

export interface Activity extends WorkType {
  subWorkTypeId: string;
}

export const useTimesheetTypes = () => {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [subWorkTypes, setSubWorkTypes] = useState<SubWorkType[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState({
    workTypes: false,
    subWorkTypes: false,
    activities: false,
  });
  const [error, setError] = useState<Error | null>(null);

  // Fetch all work types
  const fetchWorkTypes = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, workTypes: true }));
      const response = await timesheetTypesAPI.getWorkTypes();
      if (response.success && response.data) {
        setWorkTypes(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch work types'));
    } finally {
      setLoading(prev => ({ ...prev, workTypes: false }));
    }
  }, []);

  // Fetch sub work types for a specific work type
  const fetchSubWorkTypes = useCallback(async (workTypeId: string) => {
    if (!workTypeId) {
      setSubWorkTypes([]);
      setActivities([]);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, subWorkTypes: true }));
      const response = await timesheetTypesAPI.getSubWorkTypes(workTypeId);
      if (response.success && response.data) {
        setSubWorkTypes(response.data);
      } else {
        setSubWorkTypes([]);
      }
      // Clear activities when work type changes
      setActivities([]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sub work types'));
      setSubWorkTypes([]);
      setActivities([]);
    } finally {
      setLoading(prev => ({ ...prev, subWorkTypes: false }));
    }
  }, []);

  // Fetch activities for a specific sub work type
  const fetchActivities = useCallback(async (subWorkTypeId: string) => {
    if (!subWorkTypeId) {
      setActivities([]);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, activities: true }));
      const response = await timesheetTypesAPI.getActivities(subWorkTypeId);
      if (response.success && response.data) {
        setActivities(response.data);
      } else {
        setActivities([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
      setActivities([]);
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  }, []);

  // Get work type by ID
  const getWorkTypeById = useCallback((id: string) => {
    return workTypes.find(type => type.id === id);
  }, [workTypes]);

  // Get sub work type by ID
  const getSubWorkTypeById = useCallback((id: string) => {
    return subWorkTypes.find(type => type.id === id);
  }, [subWorkTypes]);

  // Get activity by ID
  const getActivityById = useCallback((id: string) => {
    return activities.find(activity => activity.id === id);
  }, [activities]);

  // Reset all data
  const reset = useCallback(() => {
    setWorkTypes([]);
    setSubWorkTypes([]);
    setActivities([]);
    setError(null);
  }, []);

  // Initial fetch of work types
  useEffect(() => {
    fetchWorkTypes();
  }, [fetchWorkTypes]);

  return {
    // Data
    workTypes,
    subWorkTypes,
    activities,
    
    // Loading states
    loading,
    loadingWorkTypes: loading.workTypes,
    loadingSubWorkTypes: loading.subWorkTypes,
    loadingActivities: loading.activities,
    
    // Errors
    error,
    
    // Actions
    fetchWorkTypes,
    fetchSubWorkTypes,
    fetchActivities,
    getWorkTypeById,
    getSubWorkTypeById,
    getActivityById,
    reset,
  };
};

export default useTimesheetTypes;
