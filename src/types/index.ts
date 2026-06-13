export type AgeGroup = 'U8' | 'U10' | 'U12' | 'U14' | 'U16'

export interface Member {
  id: string
  name: string
  avatar: string
  age: number
  ageGroup: AgeGroup
  gender: '男' | '女'
  joinDate: string
  phone: string
  parentName: string
  parentPhone: string
  status: 'active' | 'injured' | 'absent'
  note?: string
}

export type TrainingCategory = 'warmup' | 'speed' | 'strength' | 'flexibility' | 'recovery'

export interface TrainingItem {
  id: string
  name: string
  category: TrainingCategory
  sets: number
  duration: number
  targetHeartRate?: {
    min: number
    max: number
  }
  description?: string
}

export interface TrainingPlan {
  id: string
  name: string
  ageGroup: AgeGroup
  date: string
  items: TrainingItem[]
  totalDuration: number
  coach: string
}

export interface AttendanceRecord {
  memberId: string
  status: 'present' | 'absent' | 'late' | 'injured'
  reason?: string
}

export interface PerformanceRecord {
  memberId: string
  itemId: string
  itemName: string
  score: number
  unit: string
}

export interface TrainingRecord {
  id: string
  planId: string
  planName: string
  date: string
  attendance: AttendanceRecord[]
  performances: PerformanceRecord[]
  note?: string
}

export interface BodyMetrics {
  date: string
  height: number
  weight: number
}

export interface FitnessTest {
  date: string
  shuttleRun: number
  standingJump: number
  coreStrength: number
}

export interface MemberProfile {
  memberId: string
  bodyMetrics: BodyMetrics[]
  fitnessTests: FitnessTest[]
}

export type FeedbackType = 'summary' | 'notice' | 'equipment'

export interface FeedbackItem {
  id: string
  memberId: string
  memberName: string
  type: FeedbackType
  title: string
  content: string
  date: string
  isRead: boolean
}
