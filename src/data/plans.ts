import { TrainingPlan } from '@/types'

export const plansData: TrainingPlan[] = [
  {
    id: 'p1',
    name: 'U10 基础体能训练',
    ageGroup: 'U10',
    date: '2026-06-13',
    totalDuration: 90,
    coach: '李教练',
    items: [
      {
        id: 'i1',
        name: '动态热身',
        category: 'warmup',
        sets: 1,
        duration: 15,
        targetHeartRate: { min: 100, max: 120 },
        description: '关节活动、高抬腿、后踢腿'
      },
      {
        id: 'i2',
        name: '30米加速跑',
        category: 'speed',
        sets: 4,
        duration: 20,
        targetHeartRate: { min: 140, max: 165 },
        description: '每组间歇60秒'
      },
      {
        id: 'i3',
        name: '自重力量训练',
        category: 'strength',
        sets: 3,
        duration: 25,
        targetHeartRate: { min: 130, max: 155 },
        description: '深蹲15次、俯卧撑10次、平板支撑30秒'
      },
      {
        id: 'i4',
        name: '全身拉伸',
        category: 'flexibility',
        sets: 1,
        duration: 15,
        targetHeartRate: { min: 80, max: 100 },
        description: '静态拉伸每个部位保持20-30秒'
      },
      {
        id: 'i5',
        name: '放松恢复',
        category: 'recovery',
        sets: 1,
        duration: 15,
        targetHeartRate: { min: 70, max: 90 },
        description: '慢走、深呼吸、泡沫轴放松'
      }
    ]
  },
  {
    id: 'p2',
    name: 'U12 速度强化训练',
    ageGroup: 'U12',
    date: '2026-06-13',
    totalDuration: 100,
    coach: '王教练',
    items: [
      {
        id: 'i6',
        name: '全面热身',
        category: 'warmup',
        sets: 1,
        duration: 20,
        targetHeartRate: { min: 100, max: 125 },
        description: '慢跑2圈+动态拉伸+敏捷梯'
      },
      {
        id: 'i7',
        name: '50米冲刺',
        category: 'speed',
        sets: 6,
        duration: 30,
        targetHeartRate: { min: 150, max: 175 },
        description: '每组间歇90秒，全力冲刺'
      },
      {
        id: 'i8',
        name: '下肢力量',
        category: 'strength',
        sets: 4,
        duration: 25,
        targetHeartRate: { min: 140, max: 160 },
        description: '箭步蹲12次/腿、跳箱10次、提踵20次'
      },
      {
        id: 'i9',
        name: '髋部拉伸',
        category: 'flexibility',
        sets: 1,
        duration: 10,
        targetHeartRate: { min: 80, max: 100 },
        description: '重点拉伸大腿前后侧和髋部'
      },
      {
        id: 'i10',
        name: '冷身放松',
        category: 'recovery',
        sets: 1,
        duration: 15,
        targetHeartRate: { min: 70, max: 90 },
        description: '慢走调整呼吸，肌肉放松按摩'
      }
    ]
  },
  {
    id: 'p3',
    name: 'U8 趣味体能课',
    ageGroup: 'U8',
    date: '2026-06-14',
    totalDuration: 60,
    coach: '李教练',
    items: [
      {
        id: 'i11',
        name: '游戏热身',
        category: 'warmup',
        sets: 1,
        duration: 10,
        targetHeartRate: { min: 95, max: 115 },
        description: '追跑游戏、动物模仿走'
      },
      {
        id: 'i12',
        name: '标志桶绕跑',
        category: 'speed',
        sets: 3,
        duration: 15,
        targetHeartRate: { min: 130, max: 155 },
        description: 'S形绕桶跑，趣味性训练'
      },
      {
        id: 'i13',
        name: '跳跃游戏',
        category: 'strength',
        sets: 3,
        duration: 15,
        targetHeartRate: { min: 125, max: 150 },
        description: '青蛙跳、兔子跳、单脚跳'
      },
      {
        id: 'i14',
        name: '拉伸放松操',
        category: 'flexibility',
        sets: 1,
        duration: 10,
        targetHeartRate: { min: 80, max: 95 },
        description: '配合音乐的趣味拉伸'
      },
      {
        id: 'i15',
        name: '整理放松',
        category: 'recovery',
        sets: 1,
        duration: 10,
        targetHeartRate: { min: 75, max: 90 },
        description: '击掌鼓励、小结分享'
      }
    ]
  },
  {
    id: 'p4',
    name: 'U14 综合力量训练',
    ageGroup: 'U14',
    date: '2026-06-14',
    totalDuration: 110,
    coach: '张教练',
    items: [
      {
        id: 'i16',
        name: '标准热身流程',
        category: 'warmup',
        sets: 1,
        duration: 20,
        targetHeartRate: { min: 100, max: 130 },
        description: '慢跑3圈+动态拉伸+激活练习'
      },
      {
        id: 'i17',
        name: '折返跑训练',
        category: 'speed',
        sets: 5,
        duration: 25,
        targetHeartRate: { min: 155, max: 180 },
        description: '20米折返5次一组，间歇2分钟'
      },
      {
        id: 'i18',
        name: '核心力量强化',
        category: 'strength',
        sets: 4,
        duration: 30,
        targetHeartRate: { min: 135, max: 160 },
        description: '卷腹20次、俄罗斯转体30次、侧支撑45秒/侧、仰卧举腿15次'
      },
      {
        id: 'i19',
        name: '深度拉伸',
        category: 'flexibility',
        sets: 1,
        duration: 15,
        targetHeartRate: { min: 80, max: 100 },
        description: '重点拉伸核心、背部和腿部肌群'
      },
      {
        id: 'i20',
        name: '恢复整理',
        category: 'recovery',
        sets: 1,
        duration: 20,
        targetHeartRate: { min: 70, max: 90 },
        description: '慢走、泡沫轴放松、静态拉伸'
      }
    ]
  },
  {
    id: 'p5',
    name: 'U16 竞技体能训练',
    ageGroup: 'U16',
    date: '2026-06-15',
    totalDuration: 120,
    coach: '张教练',
    items: [
      {
        id: 'i21',
        name: '专业热身',
        category: 'warmup',
        sets: 1,
        duration: 25,
        targetHeartRate: { min: 105, max: 135 },
        description: '慢跑+动态拉伸+神经激活+专项热身'
      },
      {
        id: 'i22',
        name: '速度耐力',
        category: 'speed',
        sets: 6,
        duration: 30,
        targetHeartRate: { min: 160, max: 185 },
        description: '400米间歇跑，组间休息3分钟'
      },
      {
        id: 'i23',
        name: '全身力量',
        category: 'strength',
        sets: 5,
        duration: 35,
        targetHeartRate: { min: 140, max: 165 },
        description: '负重深蹲、硬拉、卧推、引体向上等复合动作'
      },
      {
        id: 'i24',
        name: '柔韧提升',
        category: 'flexibility',
        sets: 1,
        duration: 15,
        targetHeartRate: { min: 80, max: 100 },
        description: 'PNF拉伸法，提升关节活动度'
      },
      {
        id: 'i25',
        name: '系统恢复',
        category: 'recovery',
        sets: 1,
        duration: 15,
        targetHeartRate: { min: 70, max: 90 },
        description: '冷热水交替、拉伸放松、营养补充指导'
      }
    ]
  }
]
