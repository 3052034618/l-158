import { MemberProfile } from '@/types'

export const profilesData: MemberProfile[] = [
  {
    memberId: 'm1',
    bodyMetrics: [
      { date: '2026-01', height: 128, weight: 26 },
      { date: '2026-03', height: 130, weight: 27 },
      { date: '2026-05', height: 133, weight: 29 }
    ],
    fitnessTests: [
      { date: '2026-01', shuttleRun: 11.5, standingJump: 152, coreStrength: 32 },
      { date: '2026-03', shuttleRun: 11.2, standingJump: 158, coreStrength: 38 },
      { date: '2026-05', shuttleRun: 10.8, standingJump: 165, coreStrength: 45 }
    ]
  },
  {
    memberId: 'm2',
    bodyMetrics: [
      { date: '2026-01', height: 135, weight: 30 },
      { date: '2026-03', height: 138, weight: 32 },
      { date: '2026-05', height: 141, weight: 34 }
    ],
    fitnessTests: [
      { date: '2026-01', shuttleRun: 10.8, standingJump: 168, coreStrength: 40 },
      { date: '2026-03', shuttleRun: 10.5, standingJump: 175, coreStrength: 46 },
      { date: '2026-05', shuttleRun: 10.1, standingJump: 182, coreStrength: 52 }
    ]
  },
  {
    memberId: 'm5',
    bodyMetrics: [
      { date: '2026-01', height: 158, weight: 46 },
      { date: '2026-03', height: 161, weight: 49 },
      { date: '2026-05', height: 165, weight: 52 }
    ],
    fitnessTests: [
      { date: '2026-01', shuttleRun: 9.8, standingJump: 205, coreStrength: 55 },
      { date: '2026-03', shuttleRun: 9.5, standingJump: 212, coreStrength: 62 },
      { date: '2026-05', shuttleRun: 9.2, standingJump: 220, coreStrength: 70 }
    ]
  },
  {
    memberId: 'm10',
    bodyMetrics: [
      { date: '2026-01', height: 145, weight: 36 },
      { date: '2026-03', height: 148, weight: 38 },
      { date: '2026-05', height: 151, weight: 40 }
    ],
    fitnessTests: [
      { date: '2026-01', shuttleRun: 10.2, standingJump: 185, coreStrength: 48 },
      { date: '2026-03', shuttleRun: 9.9, standingJump: 192, coreStrength: 55 },
      { date: '2026-05', shuttleRun: 9.6, standingJump: 198, coreStrength: 61 }
    ]
  }
]
