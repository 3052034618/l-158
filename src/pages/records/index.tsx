import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button, Input, Picker, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store'
import {
  AttendanceRecord,
  PerformanceRecord,
  TrainingPlan,
  TrainingRecord
} from '@/types'

const attendanceStatusLabels: Record<AttendanceRecord['status'], string> = {
  present: '出勤',
  late: '迟到',
  injured: '受伤',
  absent: '请假'
}

const attendanceStatusOrder: AttendanceRecord['status'][] = [
  'present',
  'late',
  'injured',
  'absent'
]

type Stage = 'list' | 'selectPlan' | 'attendance' | 'scores'

const RecordsPage: React.FC = () => {
  const records = useAppStore(s => s.records)
  const plans = useAppStore(s => s.plans)
  const members = useAppStore(s => s.members)
  const addRecord = useAppStore(s => s.addRecord)

  const [stage, setStage] = useState<Stage>('list')
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null)

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [editReasonFor, setEditReasonFor] = useState<string | null>(null)
  const [reasonInput, setReasonInput] = useState('')

  const [performances, setPerformances] = useState<PerformanceRecord[]>([])
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({})
  const [currentItemIdx, setCurrentItemIdx] = useState(0)

  const [noteText, setNoteText] = useState('')
  const [dateStr] = useState(new Date().toISOString().split('T')[0])

  const totalStats = useMemo(() => {
    const stat = { present: 0, late: 0, injured: 0, absent: 0 }
    records.forEach(r => {
      r.attendance.forEach(a => { stat[a.status]++ })
    })
    return stat
  }, [records])

  const getMemberName = (memberId: string) => {
    return members.find(m => m.id === memberId)?.name || '未知队员'
  }

  // ============ 开始新建记录 ============
  const startNewRecord = () => {
    console.log('[Records] 开始新建记录')
    if (plans.length === 0) {
      Taro.showToast({ title: '请先创建训练计划', icon: 'none' })
      return
    }
    setStage('selectPlan')
  }

  const cancelNew = () => {
    Taro.showModal({
      title: '确认取消',
      content: '当前未保存的数据将丢失，确定取消吗？',
      success: (res) => {
        if (res.confirm) {
          resetForm()
          setStage('list')
        }
      }
    })
  }

  const resetForm = () => {
    setSelectedPlan(null)
    setAttendance([])
    setPerformances([])
    setScoreInputs({})
    setEditReasonFor(null)
    setReasonInput('')
    setNoteText('')
    setCurrentItemIdx(0)
  }

  // ============ 选计划 ============
  const selectPlan = (plan: TrainingPlan) => {
    console.log('[Records] 选择计划:', plan.name)
    setSelectedPlan(plan)
    const planMembers = members.filter(m => m.ageGroup === plan.ageGroup)
    const initAttendance: AttendanceRecord[] = planMembers.map(m => ({
      memberId: m.id,
      status: 'present'
    }))
    setAttendance(initAttendance)
    setPerformances([])
    setCurrentItemIdx(0)
    setStage('attendance')
  }

  // ============ 点名 ============
  const changeAttendanceStatus = (memberId: string, status: AttendanceRecord['status']) => {
    setAttendance(prev =>
      prev.map(a => a.memberId === memberId ? { ...a, status, reason: undefined } : a)
    )
    if (status === 'injured' || status === 'absent' || status === 'late') {
      const existing = attendance.find(a => a.memberId === memberId)
      setEditReasonFor(memberId)
      setReasonInput(existing?.reason || '')
    }
  }

  const confirmReason = () => {
    if (editReasonFor) {
      setAttendance(prev =>
        prev.map(a => a.memberId === editReasonFor
          ? { ...a, reason: reasonInput.trim() || undefined }
          : a
        )
      )
    }
    setEditReasonFor(null)
    setReasonInput('')
  }

  const markAllPresent = () => {
    setAttendance(prev => prev.map(a => ({ ...a, status: 'present', reason: undefined })))
    Taro.showToast({ title: '已全部签到', icon: 'success' })
  }

  const attendanceStats = useMemo(() => {
    return {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      injured: attendance.filter(a => a.status === 'injured').length,
      absent: attendance.filter(a => a.status === 'absent').length
    }
  }, [attendance])

  const goToScores = () => {
    if (attendance.length === 0) {
      Taro.showToast({ title: '请先选择计划', icon: 'none' })
      return
    }
    setStage('scores')
  }

  // ============ 录入成绩 ============
  const scorableItems = useMemo(() => {
    if (!selectedPlan) return []
    return selectedPlan.items.filter(it =>
      it.category === 'speed' || it.category === 'strength'
    )
  }, [selectedPlan])

  const presentMembers = useMemo(() => {
    return attendance.filter(a => a.status === 'present' || a.status === 'late')
  }, [attendance])

  const currentScorableItem = scorableItems[currentItemIdx]

  const handleScoreInput = (memberId: string, value: string) => {
    setScoreInputs(prev => ({ ...prev, [`${currentItemIdx}_${memberId}`]: value }))
  }

  const getScoreInput = (memberId: string) => {
    return scoreInputs[`${currentItemIdx}_${memberId}`] || ''
  }

  const getCurrentItemDefaultUnit = () => {
    if (!currentScorableItem) return '次'
    const nm = currentScorableItem.name
    if (nm.includes('跑') || nm.includes('冲刺')) return '秒'
    if (nm.includes('跳')) return 'cm'
    return '组'
  }

  const saveCurrentScores = () => {
    if (!currentScorableItem) return
    const unit = getCurrentItemDefaultUnit()
    const newPerfs: PerformanceRecord[] = presentMembers
      .map(m => {
        const val = Number(getScoreInput(m.memberId))
        if (isNaN(val) || val <= 0) return null
        return {
          memberId: m.memberId,
          itemId: currentScorableItem.id,
          itemName: currentScorableItem.name,
          score: val,
          unit
        }
      })
      .filter(Boolean) as PerformanceRecord[]

    setPerformances(prev => {
      const withoutCurrent = prev.filter(p => p.itemId !== currentScorableItem.id)
      return [...withoutCurrent, ...newPerfs]
    })
  }

  const saveAllAndFinish = () => {
    saveCurrentScores()
    if (!selectedPlan) return
    const now = new Date()
    const dateTimeStr = `${dateStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    // 收集所有成绩
    const allPerfs: PerformanceRecord[] = scorableItems.flatMap((item, idx) => {
      return presentMembers
        .map(m => {
          const key = `${idx}_${m.memberId}`
          const val = Number(scoreInputs[key])
          if (isNaN(val) || val <= 0) {
            const existing = performances.find(p => p.memberId === m.memberId && p.itemId === item.id)
            return existing || null
          }
          let unit = '次'
          if (item.name.includes('跑') || item.name.includes('冲刺')) unit = '秒'
          else if (item.name.includes('跳')) unit = 'cm'
          else if (item.name.includes('力量')) unit = '组'
          return {
            memberId: m.memberId,
            itemId: item.id,
            itemName: item.name,
            score: val,
            unit
          }
        })
        .filter(Boolean) as PerformanceRecord[]
    })

    const record: TrainingRecord = {
      id: `rec_${Date.now()}`,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      date: dateTimeStr,
      attendance: JSON.parse(JSON.stringify(attendance)),
      performances: allPerfs,
      note: noteText.trim() || undefined
    }

    console.log('[Records] 保存训练记录:', record)
    addRecord(record)
    Taro.showToast({ title: '训练记录已保存', icon: 'success' })
    resetForm()
    setStage('list')
  }

  // ============ 渲染 ============
  const getAttendanceClass = (s: AttendanceRecord['status']) => {
    const m = {
      present: styles.statusPresent,
      late: styles.statusLate,
      injured: styles.statusInjured,
      absent: styles.statusAbsent
    }
    return m[s]
  }

  const getDotClass = (s: AttendanceRecord['status']) => {
    const m = {
      present: styles.dotPresent,
      late: styles.dotLate,
      injured: styles.dotInjured,
      absent: styles.dotAbsent
    }
    return m[s]
  }

  if (stage === 'selectPlan') {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.stepperHeader}>
          <Text className={styles.stepBack} onClick={() => setStage('list')}>← 返回</Text>
          <Text className={styles.stepTitle}>第1步：选择训练计划</Text>
          <Text style={{ width: 80 }}></Text>
        </View>
        <ScrollView className={styles.planPickerList}>
          {plans.map(p => (
            <View
              key={p.id}
              className={styles.planPickerCard}
              onClick={() => selectPlan(p)}
            >
              <View className={styles.ppTop}>
                <Text className={styles.ppName}>{p.name}</Text>
                <View className={styles.ageTag}>{p.ageGroup}</View>
              </View>
              <View className={styles.ppMeta}>
                <Text>📋 {p.items.length}个项目 · ⏱ {p.totalDuration}分钟 · 👥 {members.filter(m => m.ageGroup === p.ageGroup).length}名队员</Text>
              </View>
              {p.date && <View className={styles.ppDate}>🗓 {p.date}</View>}
            </View>
          ))}
        </ScrollView>
      </View>
    )
  }

  if (stage === 'attendance' && selectedPlan) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.stepperHeader}>
          <Text className={styles.stepBack} onClick={() => setStage('selectPlan')}>← 选计划</Text>
          <Text className={styles.stepTitle}>第2步：训练点名</Text>
          <Text style={{ width: 80 }}></Text>
        </View>

        <View className={styles.planSummary}>
          <Text className={styles.planSumName}>{selectedPlan.name}</Text>
          <Text className={styles.planSumSub}>
            {selectedPlan.ageGroup} · 共{attendanceStats.total}名队员
          </Text>
        </View>

        <View className={styles.attendanceStatsBar}>
          <View className={styles.asbItem}>
            <Text className={styles.asbNum} style={{ color: '#00B42A' }}>{attendanceStats.present}</Text>
            <Text className={styles.asbLbl}>出勤</Text>
          </View>
          <View className={styles.asbItem}>
            <Text className={styles.asbNum} style={{ color: '#FF7D00' }}>{attendanceStats.late}</Text>
            <Text className={styles.asbLbl}>迟到</Text>
          </View>
          <View className={styles.asbItem}>
            <Text className={styles.asbNum} style={{ color: '#F53F3F' }}>{attendanceStats.injured}</Text>
            <Text className={styles.asbLbl}>受伤</Text>
          </View>
          <View className={styles.asbItem}>
            <Text className={styles.asbNum} style={{ color: '#86909C' }}>{attendanceStats.absent}</Text>
            <Text className={styles.asbLbl}>请假</Text>
          </View>
          <Button className={styles.markAllBtn} onClick={markAllPresent}>全部签到</Button>
        </View>

        <ScrollView className={styles.attendanceFormList}>
          {attendance.map(a => {
            const member = members.find(m => m.id === a.memberId)
            return (
              <View key={a.memberId} className={styles.attendanceRow}>
                <View className={styles.arMember}>
                  <Image className={styles.arAvatar} src={member?.avatar} mode='aspectFill' />
                  <View style={{ flex: 1 }}>
                    <Text className={styles.arName}>{member?.name}</Text>
                    {a.reason && <Text className={styles.arReasonPreview}>({a.reason})</Text>}
                  </View>
                </View>
                <View className={styles.arStatusBtns}>
                  {attendanceStatusOrder.map(s => (
                    <View
                      key={s}
                      className={classnames(
                        styles.statusChip,
                        a.status === s && getAttendanceClass(s),
                        a.status !== s && styles.statusChipOff
                      )}
                      onClick={() => changeAttendanceStatus(a.memberId, s)}
                    >
                      {attendanceStatusLabels[s]}
                    </View>
                  ))}
                </View>
                {(a.status === 'injured' || a.status === 'absent' || a.status === 'late') && (
                  <Button
                    className={styles.editReasonBtn}
                    onClick={() => { setEditReasonFor(a.memberId); setReasonInput(a.reason || '') }}
                  >
                    {a.reason ? '改原因' : '+ 原因'}
                  </Button>
                )}
              </View>
            )
          })}
        </ScrollView>

        <View className={styles.bottomBar}>
          <Button className={styles.stepCancel} onClick={cancelNew}>取消</Button>
          <Button className={styles.stepNext} onClick={goToScores}>下一步 录成绩 →</Button>
        </View>

        {editReasonFor && (
          <View className={styles.reasonMask} onClick={confirmReason}>
            <View className={styles.reasonPanel} onClick={e => e.stopPropagation && e.stopPropagation()}>
              <Text className={styles.reasonTitle}>
                填写{attendanceStatusLabels[attendance.find(a => a.memberId === editReasonFor)?.status || 'absent']}原因
              </Text>
              <Text className={styles.reasonName}>
                队员：{members.find(m => m.id === editReasonFor)?.name}
              </Text>
              <Input
                className={styles.reasonInput}
                placeholder='如：发烧请假、膝盖扭伤、堵车等'
                value={reasonInput}
                onInput={e => setReasonInput(e.detail.value)}
              />
              <View className={styles.reasonBtns}>
                <Button className={styles.reasonCancel} onClick={confirmReason}>跳过</Button>
                <Button className={styles.reasonConfirm} onClick={confirmReason}>确定</Button>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }

  if (stage === 'scores' && selectedPlan) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.stepperHeader}>
          <Text className={styles.stepBack} onClick={() => setStage('attendance')}>← 点名</Text>
          <Text className={styles.stepTitle}>第3步：录入成绩</Text>
          <Text style={{ width: 80 }}></Text>
        </View>

        {scorableItems.length > 0 ? (
          <>
            <ScrollView
              className={styles.scoreItemTabs}
              scrollX
              enhanced
              showScrollbar={false}
            >
              <View className={styles.scoreItemTabsInner}>
                {scorableItems.map((item, idx) => (
                  <View
                    key={item.id}
                    className={classnames(
                      styles.scoreItemTab,
                      idx === currentItemIdx && styles.scoreItemTabActive
                    )}
                    onClick={() => { saveCurrentScores(); setCurrentItemIdx(idx) }}
                  >
                    {idx + 1}. {item.name}
                  </View>
                ))}
              </View>
            </ScrollView>

            <View className={styles.scoreProgress}>
              <Text>{currentItemIdx + 1} / {scorableItems.length}</Text>
              <Text>项目：{currentScorableItem?.name}（{currentScorableItem?.sets}组）</Text>
            </View>

            <View className={styles.scoreListHint}>
              <Text>📝 请为每名参训队员输入成绩</Text>
            </View>

            <ScrollView className={styles.scoreInputList}>
              {presentMembers.length > 0 ? (
                presentMembers.map(a => {
                  const member = members.find(m => m.id === a.memberId)
                  return (
                    <View key={a.memberId} className={styles.scoreRow}>
                      <Image className={styles.srAvatar} src={member?.avatar} mode='aspectFill' />
                      <Text className={styles.srName}>{member?.name}</Text>
                      <Input
                        className={styles.srInput}
                        type='digit'
                        placeholder='输入成绩'
                        value={getScoreInput(a.memberId)}
                        onInput={e => handleScoreInput(a.memberId, e.detail.value)}
                      />
                      <Text className={styles.srUnit}>{getCurrentItemDefaultUnit()}</Text>
                    </View>
                  )
                })
              ) : (
                <View className={styles.emptySmall}>
                  <Text>没有出勤队员，无需录入成绩</Text>
                </View>
              )}
            </ScrollView>

            <View className={styles.batchScoreBar}>
              <Text className={styles.batchLabel}>批量设置同值：</Text>
              <Input
                className={styles.batchInput}
                type='digit'
                placeholder='成绩'
                onInput={e => {
                  const v = e.detail.value
                  if (!v) return
                  const patch: Record<string, string> = {}
                  presentMembers.forEach(a => {
                    patch[`${currentItemIdx}_${a.memberId}`] = v
                  })
                  setScoreInputs(prev => ({ ...prev, ...patch }))
                }}
              />
            </View>
          </>
        ) : (
          <View className={styles.emptyBig}>
            <Text>📋 本计划无可记录成绩的项目（速度/力量类）</Text>
            <Text style={{ fontSize: 24, color: '#86909C', marginTop: 8 }}>
              可直接填写备注后保存记录
            </Text>
          </View>
        )}

        <View className={styles.noteSection}>
          <Text className={styles.noteLabel}>训练备注（可选）</Text>
          <Input
            className={styles.noteInput}
            placeholder='如：整体表现、个别提醒等...'
            value={noteText}
            onInput={e => setNoteText(e.detail.value)}
          />
        </View>

        <View className={styles.bottomBar}>
          <Button className={styles.stepCancel} onClick={cancelNew}>取消</Button>
          <Button className={styles.stepNext} onClick={saveAllAndFinish}>✓ 保存训练记录</Button>
        </View>
      </View>
    )
  }

  // ===== 列表页 =====
  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>现场记录</Text>
        <View className={styles.summaryCard}>
          <View className={styles.summaryStats}>
            <View className={styles.statBlock}>
              <Text className={styles.statValue}>{totalStats.present}</Text>
              <Text className={styles.statLabel}>出勤</Text>
            </View>
            <View className={styles.statBlock}>
              <Text className={styles.statValue}>{totalStats.late}</Text>
              <Text className={styles.statLabel}>迟到</Text>
            </View>
            <View className={styles.statBlock}>
              <Text className={styles.statValue}>{totalStats.injured}</Text>
              <Text className={styles.statLabel}>受伤</Text>
            </View>
            <View className={styles.statBlock}>
              <Text className={styles.statValue}>{totalStats.absent}</Text>
              <Text className={styles.statLabel}>请假</Text>
            </View>
          </View>
          <Button className={styles.newRecordBtn} onClick={startNewRecord}>
            + 开始训练记录
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>训练记录列表</Text>

        <ScrollView className={styles.recordList}>
          {records.length > 0 ? (
            records.map(record => (
              <View key={record.id} className={styles.recordCard}>
                <View className={styles.recordHeader}>
                  <Text className={styles.recordTitle}>{record.planName}</Text>
                  <Text className={styles.recordDate}>{record.date}</Text>
                </View>

                <View className={styles.recordContent}>
                  <View className={styles.attendanceSection}>
                    <Text className={styles.subTitle}>考勤情况</Text>
                    <View className={styles.attendanceList}>
                      {record.attendance.map((a, idx) => (
                        <View
                          key={idx}
                          className={classnames(styles.attendanceItem, getAttendanceClass(a.status))}
                        >
                          <View className={classnames(styles.statusDot, getDotClass(a.status))} />
                          <Text>{getMemberName(a.memberId)}</Text>
                          <Text>{attendanceStatusLabels[a.status]}</Text>
                          {a.reason && (
                            <Text className={styles.reasonTag}>({a.reason})</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>

                  {record.performances.length > 0 && (
                    <View className={styles.performanceSection}>
                      <Text className={styles.subTitle}>成绩记录</Text>
                      <View className={styles.perfTable}>
                        <View className={styles.perfHeader}>
                          <Text className={styles.perfHeaderCell}>队员</Text>
                          <Text className={styles.perfHeaderCell}>项目</Text>
                          <Text className={styles.perfHeaderCell}>成绩</Text>
                        </View>
                        {record.performances.map((p, idx) => (
                          <View key={idx} className={styles.perfRow}>
                            <Text className={styles.perfCell}>{getMemberName(p.memberId)}</Text>
                            <Text className={styles.perfCell}>{p.itemName}</Text>
                            <Text className={classnames(styles.perfCell, styles.perfScore)}>
                              {p.score} {p.unit}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {record.note && (
                    <View className={styles.recordNote}>
                      <Text>📝 {record.note}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>暂无训练记录，点击"开始训练记录"</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

export default RecordsPage
