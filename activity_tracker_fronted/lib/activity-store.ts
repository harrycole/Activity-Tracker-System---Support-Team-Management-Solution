// Client-side activity store using localStorage
interface Activity {
  id: string
  title: string
  description: string
  status: "pending" | "done"
  createdBy: string
  createdByName: string
  createdByDepartment: string
  createdAt: string
  updatedAt: string
  remark: string
  updates: ActivityUpdate[]
}

interface ActivityUpdate {
  id: string
  status: "pending" | "done"
  remark: string
  updatedBy: string
  updatedByName: string
  updatedByDepartment: string
  updatedAt: string
}

export function getActivities(): Activity[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("activities")
  return stored ? JSON.parse(stored) : []
}

export function saveActivities(activities: Activity[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("activities", JSON.stringify(activities))
}

export function createActivity(
  title: string,
  description: string,
  userId: string,
  userName: string,
  userDepartment: string,
): Activity {
  const activity: Activity = {
    id: Date.now().toString(),
    title,
    description,
    status: "pending",
    createdBy: userId,
    createdByName: userName,
    createdByDepartment: userDepartment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    remark: "",
    updates: [],
  }

  const activities = getActivities()
  activities.push(activity)
  saveActivities(activities)

  return activity
}

export function updateActivityStatus(
  activityId: string,
  status: "pending" | "done",
  remark: string,
  userId: string,
  userName: string,
  userDepartment: string,
): Activity | null {
  const activities = getActivities()
  const activity = activities.find((a) => a.id === activityId)

  if (!activity) return null

  const update: ActivityUpdate = {
    id: Date.now().toString(),
    status,
    remark,
    updatedBy: userId,
    updatedByName: userName,
    updatedByDepartment: userDepartment,
    updatedAt: new Date().toISOString(),
  }

  activity.status = status
  activity.remark = remark
  activity.updatedAt = new Date().toISOString()
  activity.updates.push(update)

  saveActivities(activities)
  return activity
}

export function getActivitiesByDate(date: string): Activity[] {
  const activities = getActivities()
  return activities.filter((a) => a.createdAt.startsWith(date))
}

export function getActivitiesByDateRange(startDate: string, endDate: string): Activity[] {
  const activities = getActivities()
  const start = new Date(startDate)
  const end = new Date(endDate)

  return activities.filter((a) => {
    const actDate = new Date(a.createdAt)
    return actDate >= start && actDate <= end
  })
}
