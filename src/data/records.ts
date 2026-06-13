import { TrainingRecord } from '@/types'

export const recordsData: TrainingRecord[] = [
  {
    id: 'r1',
    planId: 'p1',
    planName: 'U10 基础体能训练',
    date: '2026-06-12',
    attendance: [
      { memberId: 'm2', status: 'present' },
      { memberId: 'm4', status: 'present' },
      { memberId: 'm11', status: 'late', reason: '路上堵车' },
      { memberId: 'm3', status: 'injured', reason: '脚踝扭伤' }
    ],
    performances: [
      { memberId: 'm2', itemId: 'i2', itemName: '30米加速跑', score: 5.2, unit: '秒' },
      { memberId: 'm2', itemId: 'i3', itemName: '自重力量训练', score: 3, unit: '组' },
      { memberId: 'm4', itemId: 'i2', itemName: '30米加速跑', score: 5.6, unit: '秒' },
      { memberId: 'm4', itemId: 'i3', itemName: '自重力量训练', score: 3, unit: '组' },
      { memberId: 'm11', itemId: 'i2', itemName: '30米加速跑', score: 5.8, unit: '秒' },
      { memberId: 'm11', itemId: 'i3', itemName: '自重力量训练', score: 2, unit: '组' }
    ],
    note: '今日整体表现良好，注意李思琪同学跑步姿势需矫正'
  },
  {
    id: 'r2',
    planId: 'p2',
    planName: 'U12 速度强化训练',
    date: '2026-06-12',
    attendance: [
      { memberId: 'm3', status: 'injured', reason: '脚踝扭伤，医嘱休养' },
      { memberId: 'm7', status: 'absent', reason: '期末考试复习' },
      { memberId: 'm10', status: 'present' }
    ],
    performances: [
      { memberId: 'm10', itemId: 'i7', itemName: '50米冲刺', score: 8.5, unit: '秒' },
      { memberId: 'm10', itemId: 'i8', itemName: '下肢力量', score: 4, unit: '组' }
    ]
  },
  {
    id: 'r3',
    planId: 'p4',
    planName: 'U14 综合力量训练',
    date: '2026-06-11',
    attendance: [
      { memberId: 'm5', status: 'present' },
      { memberId: 'm9', status: 'present' }
    ],
    performances: [
      { memberId: 'm5', itemId: 'i17', itemName: '折返跑训练', score: 12.3, unit: '秒' },
      { memberId: 'm5', itemId: 'i18', itemName: '核心力量强化', score: 4, unit: '组' },
      { memberId: 'm9', itemId: 'i17', itemName: '折返跑训练', score: 11.8, unit: '秒' },
      { memberId: 'm9', itemId: 'i18', itemName: '核心力量强化', score: 4, unit: '组' }
    ],
    note: '两名队员进步明显，继续保持'
  }
]
