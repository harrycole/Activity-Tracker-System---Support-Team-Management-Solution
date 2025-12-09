// lib/activity-store.ts
import axiosInstance from '@/lib/axiosInstance'

export interface Activity {
  activity_id: string
  title: string
  description: string | null
  status: "pending" | "done"
  created_by: string  // user_id
  created_at: string
  updated_at: string
  
  // Your backend returns 'creator' not 'user'
  creator?: {
    user_id: string
    name: string
    department?: string | null
    email: string
    email_verified_at: string | null
    created_at: string
    updated_at: string
  }
  updates?: Array<{
    update_id: string
    progress: string
    status: string
    remark: string | null
    created_at: string
  }>
}

export interface ActivityUpdate {
  update_id: string
  activity_id: string
  status: "pending" | "done"
  remark: string | null
  updated_by: string  // user_id
  created_at: string
  updated_at: string
  // Your backend might return this as 'updater' or similar
  updater?: {
    user_id: string
    name: string
    department?: string | null
    email: string
    email_verified_at: string | null
    created_at: string
    updated_at: string
  }
}

// Fetch all activities from backend
export async function fetchActivities(): Promise<Activity[]> {
  try {
    const response = await axiosInstance.get('/activities')
    return response.data
  } catch (error) {
    console.error('Error fetching activities:', error)
    return []
  }
}

// Fetch single activity by ID
export async function fetchActivity(id: string): Promise<Activity | null> {
  try {
    const response = await axiosInstance.get(`/activities/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching activity:', error)
    return null
  }
}

// Fetch activity updates by activity ID
export async function fetchActivityUpdates(activityId: string): Promise<ActivityUpdate[]> {
  try {
    const response = await axiosInstance.get(`/activity-updates?activity_id=${activityId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching activity updates:', error)
    return []
  }
}

// Create new activity
export async function createActivity(
  title: string,
  description: string,
  remark?: string
): Promise<Activity | null> {
  try {
    const response = await axiosInstance.post('/activities', {
      title,
      description,
      remark: remark || '',
    })
    return response.data
  } catch (error) {
    console.error('Error creating activity:', error)
    return null
  }
}

// Update activity status
export async function updateActivityStatus(
  activityId: string,
  status: "pending" | "done",
  remark?: string
): Promise<Activity | null> {
  try {
    // First update the activity status
    const activityResponse = await axiosInstance.put(`/activities/${activityId}`, {
      status,
    })
    
    // If there's a remark, create an activity update
    if (remark && remark.trim()) {
      await axiosInstance.post('/activity-updates', {
        activity_id: activityId,
        status,
        remark: remark.trim(),
      })
    }
    
    return activityResponse.data
  } catch (error) {
    console.error('Error updating activity:', error)
    return null
  }
}

// Fetch daily activities
export async function fetchDailyActivities(date?: string): Promise<Activity[]> {
  try {
    // Use current date if no date provided
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const response = await axiosInstance.post('/activities-daily', {
      date: targetDate
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching daily activities:', error);
    return [];
  }
}

// Create activity update (for tracking changes)
export async function createActivityUpdate(
  activityId: string,
  status: "pending" | "done",
  remark?: string
): Promise<ActivityUpdate | null> {
  try {
    const response = await axiosInstance.post('/activity-updates', {
      activity_id: activityId,
      status,
      remark: remark || '',
    })
    return response.data
  } catch (error) {
    console.error('Error creating activity update:', error)
    return null
  }
}

// Fetch activities for reporting (date range)
export async function fetchActivitiesByDateRange(startDate: string, endDate: string): Promise<Activity[]> {
  try {
    const response = await axiosInstance.get(`/activities?start_date=${startDate}&end_date=${endDate}`)
    return response.data
  } catch (error) {
    console.error('Error fetching activities by date range:', error)
    return []
  }
}

// Fetch all activities with detailed information (including creator and updates)
export async function fetchActivitiesDetailed(): Promise<Activity[]> {
  try {
    const response = await axiosInstance.get('/activities?include=creator,updates')
    return response.data
  } catch (error) {
    console.error('Error fetching detailed activities:', error)
    return []
  }
}
