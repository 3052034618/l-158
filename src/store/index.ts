import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import { TrainingPlan, TrainingRecord, FeedbackItem, Member } from '@/types'
import { plansData } from '@/data/plans'
import { recordsData } from '@/data/records'
import { feedbackData } from '@/data/feedback'
import { membersData } from '@/data/members'

const taroStorage = {
  getItem: (name: string) => {
    try {
      const val = Taro.getStorageSync(name)
      return val === '' || val === null || val === undefined ? null : JSON.stringify(val)
    } catch (e) {
      console.error('[Store] getItem error:', e)
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, JSON.parse(value))
    } catch (e) {
      console.error('[Store] setItem error:', e)
    }
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name)
    } catch (e) {
      console.error('[Store] removeItem error:', e)
    }
  }
}

interface AppState {
  members: Member[]
  plans: TrainingPlan[]
  records: TrainingRecord[]
  feedback: FeedbackItem[]
  currentPlanId: string | null
  currentRecordId: string | null

  setCurrentPlanId: (id: string | null) => void
  setCurrentRecordId: (id: string | null) => void

  addPlan: (plan: TrainingPlan) => void
  updatePlan: (plan: TrainingPlan) => void
  deletePlan: (id: string) => void

  addRecord: (record: TrainingRecord) => void
  updateRecord: (record: TrainingRecord) => void

  addFeedback: (item: FeedbackItem) => void
  markFeedbackRead: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      members: membersData,
      plans: plansData,
      records: recordsData,
      feedback: feedbackData,
      currentPlanId: null,
      currentRecordId: null,

      setCurrentPlanId: (id) => set({ currentPlanId: id }),
      setCurrentRecordId: (id) => set({ currentRecordId: id }),

      addPlan: (plan) => {
        console.log('[Store] addPlan:', plan.id, plan.name)
        set({ plans: [...get().plans, plan] })
      },
      updatePlan: (plan) => {
        console.log('[Store] updatePlan:', plan.id)
        set({
          plans: get().plans.map((p) => (p.id === plan.id ? plan : p))
        })
      },
      deletePlan: (id) => {
        console.log('[Store] deletePlan:', id)
        set({ plans: get().plans.filter((p) => p.id !== id) })
      },

      addRecord: (record) => {
        console.log('[Store] addRecord:', record.id)
        set({ records: [record, ...get().records] })
      },
      updateRecord: (record) => {
        console.log('[Store] updateRecord:', record.id)
        set({
          records: get().records.map((r) => (r.id === record.id ? record : r))
        })
      },

      addFeedback: (item) => {
        console.log('[Store] addFeedback:', item.id)
        set({ feedback: [item, ...get().feedback] })
      },
      markFeedbackRead: (id) => {
        console.log('[Store] markFeedbackRead:', id)
        set({
          feedback: get().feedback.map((f) =>
            f.id === id ? { ...f, isRead: true } : f
          )
        })
      }
    }),
    {
      name: 'smart-sports-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        plans: state.plans,
        records: state.records,
        feedback: state.feedback
      }),
      onRehydrateStorage: () => (state) => {
        console.log('[Store] rehydrated, plans count:', state?.plans?.length)
      }
    }
  )
)
