import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Button, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store'
import { FeedbackItem, FeedbackType, Member, TrainingRecord } from '@/types'

const typeFilters: (FeedbackType | 'all')[] = ['all', 'summary', 'notice', 'equipment']

const typeLabels: Record<FeedbackType | 'all', string> = {
  all: '全部',
  summary: '训练摘要',
  notice: '注意事项',
  equipment: '装备提醒'
}

const FeedbackPage: React.FC = () => {
  const feedback = useAppStore(s => s.feedback)
  const records = useAppStore(s => s.records)
  const members = useAppStore(s => s.members)
  const plans = useAppStore(s => s.plans)
  const addFeedback = useAppStore(s => s.addFeedback)
  const markFeedbackRead = useAppStore(s => s.markFeedbackRead)

  const [selectedType, setSelectedType] = useState<FeedbackType | 'all'>('all')
  const [showComposer, setShowComposer] = useState(false)
  const [composerMode, setComposerMode] = useState<'fromRecord' | 'manual'>('fromRecord')

  // From record state
  const [pickedRecordId, setPickedRecordId] = useState<string>('')
  const [summaryContent, setSummaryContent] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])

  // Manual state
  const [manualType, setManualType] = useState<FeedbackType>('notice')
  const [manualMemberId, setManualMemberId] = useState<string>('')
  const [manualTitle, setManualTitle] = useState('')
  const [manualContent, setManualContent] = useState('')

  const unreadCount = useMemo(() => {
    return feedback.filter(f => !f.isRead).length
  }, [feedback])

  const filteredFeedback = useMemo(() => {
    if (selectedType === 'all') return feedback
    return feedback.filter(f => f.type === selectedType)
  }, [selectedType, feedback])

  const pickedRecord = useMemo(() =>
    records.find(r => r.id === pickedRecordId),
    [records, pickedRecordId]
  )

  const recordMembers = useMemo(() => {
    if (!pickedRecord) return []
    const plan = plans.find(p => p.id === pickedRecord.planId)
    const ageGroup = plan?.ageGroup
    if (ageGroup) {
      return members.filter(m => m.ageGroup === ageGroup)
    }
    return pickedRecord.attendance.map(a =>
      members.find(m => m.id === a.memberId)
    ).filter(Boolean) as Member[]
  }, [pickedRecord, members, plans])

  const generateSummary = (record: TrainingRecord) => {
    const presentCount = record.attendance.filter(a => a.status === 'present').length
    const lateCount = record.attendance.filter(a => a.status === 'late').length
    const injuredCount = record.attendance.filter(a => a.status === 'injured').length
    const absentCount = record.attendance.filter(a => a.status === 'absent').length

    const parts: string[] = []
    parts.push(`今日完成"${record.planName}"训练，`)

    const attParts: string[] = []
    if (presentCount > 0) attParts.push(`${presentCount}人出勤`)
    if (lateCount > 0) attParts.push(`${lateCount}人迟到`)
    if (injuredCount > 0) attParts.push(`${injuredCount}人受伤`)
    if (absentCount > 0) attParts.push(`${absentCount}人请假`)
    parts.push('考勤情况：' + attParts.join('，') + '。')

    if (record.performances.length > 0) {
      const byItem: Record<string, { scores: number[]; unit: string }> = {}
      record.performances.forEach(p => {
        if (!byItem[p.itemName]) byItem[p.itemName] = { scores: [], unit: p.unit }
        byItem[p.itemName].scores.push(p.score)
      })
      const perfs: string[] = []
      Object.entries(byItem).forEach(([name, data]) => {
        if (data.scores.length > 0) {
          const avg = (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
          perfs.push(`${name}平均${avg}${data.unit}`)
        }
      })
      if (perfs.length > 0) {
        parts.push('成绩情况：' + perfs.join('，') + '。')
      }
    }

    if (record.note) {
      parts.push(`教练备注：${record.note}`)
    }

    return parts.join('')
  }

  const handlePickRecord = (record: TrainingRecord) => {
    console.log('[Feedback] 选择记录生成摘要:', record.id)
    setPickedRecordId(record.id)
    const summary = generateSummary(record)
    setSummaryContent(summary)
    // 默认选所有参与训练的队员
    const memberIds = record.attendance
      .filter(a => a.status === 'present' || a.status === 'late')
      .map(a => a.memberId)
    setSelectedMemberIds(memberIds)
  }

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const selectAllMembers = () => {
    setSelectedMemberIds(recordMembers.map(m => m.id))
  }

  const clearAllMembers = () => {
    setSelectedMemberIds([])
  }

  const closeComposer = () => {
    setShowComposer(false)
    setPickedRecordId('')
    setSummaryContent('')
    setSelectedMemberIds([])
    setManualMemberId('')
    setManualTitle('')
    setManualContent('')
    setManualType('notice')
  }

  const sendFromRecord = () => {
    if (!pickedRecord) {
      Taro.showToast({ title: '请选择训练记录', icon: 'none' })
      return
    }
    if (selectedMemberIds.length === 0) {
      Taro.showToast({ title: '请选择接收队员', icon: 'none' })
      return
    }
    if (!summaryContent.trim()) {
      Taro.showToast({ title: '请输入摘要内容', icon: 'none' })
      return
    }
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    selectedMemberIds.forEach(mid => {
      const member = members.find(m => m.id === mid)
      const item: FeedbackItem = {
        id: `fb_${Date.now()}_${mid}_${Math.random().toString(36).slice(2, 6)}`,
        memberId: mid,
        memberName: member?.name || '未知',
        type: 'summary',
        title: `${pickedRecord.date.split(' ')[0]} 训练摘要`,
        content: summaryContent,
        date: dateStr,
        isRead: false
      }
      addFeedback(item)
    })

    Taro.showToast({
      title: `已向${selectedMemberIds.length}名家长发送`,
      icon: 'success'
    })
    closeComposer()
  }

  const sendManual = () => {
    if (!manualMemberId) {
      Taro.showToast({ title: '请选择队员', icon: 'none' })
      return
    }
    if (!manualTitle.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    if (!manualContent.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' })
      return
    }
    const member = members.find(m => m.id === manualMemberId)
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const item: FeedbackItem = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      memberId: manualMemberId,
      memberName: member?.name || '未知',
      type: manualType,
      title: manualTitle,
      content: manualContent,
      date: dateStr,
      isRead: false
    }
    addFeedback(item)
    Taro.showToast({ title: '发送成功', icon: 'success' })
    closeComposer()
  }

  const handleFeedbackClick = (item: FeedbackItem) => {
    if (!item.isRead) markFeedbackRead(item.id)
    Taro.showModal({
      title: `${typeLabels[item.type]} · ${item.memberName}`,
      content: `${item.title}\n\n${item.content}\n\n发送时间：${item.date}`,
      showCancel: false,
      confirmText: '知道了'
    })
  }

  const getTypeCardClass = (type: FeedbackType) => {
    const m: Record<FeedbackType, string> = {
      summary: styles.typeSummary,
      notice: styles.typeNotice,
      equipment: styles.typeEquipment
    }
    return m[type]
  }

  const getTypeTagClass = (type: FeedbackType) => {
    const m: Record<FeedbackType, string> = {
      summary: styles.tagSummary,
      notice: styles.tagNotice,
      equipment: styles.tagEquipment
    }
    return m[type]
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View>
            <Text className={styles.pageTitle}>家长反馈</Text>
            <View className={styles.headerStatsRow}>
              {unreadCount > 0 && (
                <View className={styles.unreadBadge}>{unreadCount} 条未读</View>
              )}
              <Text className={styles.headerDesc}>向家长同步训练信息</Text>
            </View>
          </View>
          <Button className={styles.sendBtn} onClick={() => setShowComposer(true)}>
            + 发送
          </Button>
        </View>

        <ScrollView
          className={styles.filterScroll}
          scrollX
          enhanced
          showScrollbar={false}
        >
          <View className={styles.filterContainer}>
            {typeFilters.map(type => (
              <View
                key={type}
                className={classnames(
                  styles.filterItem,
                  selectedType === type && styles.filterActive
                )}
                onClick={() => setSelectedType(type)}
              >
                {typeLabels[type]}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className={styles.feedbackList}>
        {filteredFeedback.length > 0 ? (
          filteredFeedback.map(item => (
            <View
              key={item.id}
              className={classnames(styles.feedbackCard, getTypeCardClass(item.type))}
              onClick={() => handleFeedbackClick(item)}
            >
              <View className={styles.cardHeader}>
                <View className={styles.memberInfo}>
                  <Text className={styles.memberName}>{item.memberName}</Text>
                  <View className={classnames(styles.typeTag, getTypeTagClass(item.type))}>
                    {typeLabels[item.type]}
                  </View>
                </View>
                {!item.isRead && <View className={styles.unreadDot} />}
              </View>

              <Text className={styles.feedbackTitle}>{item.title}</Text>
              <Text className={styles.feedbackContent}>{item.content}</Text>

              <View className={styles.cardFooter}>
                <Text className={styles.feedbackDate}>{item.date}</Text>
                <Text
                  className={classnames(
                    styles.readStatus,
                    !item.isRead && styles.unreadText
                  )}
                >
                  {item.isRead ? '已读' : '未读'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📨</Text>
            <Text className={styles.emptyText}>暂无反馈信息，点击"发送"创建</Text>
          </View>
        )}
      </ScrollView>

      {showComposer && (
        <View className={styles.composerMask} onClick={closeComposer}>
          <View
            className={styles.composerPanel}
            onClick={e => e.stopPropagation && e.stopPropagation()}
          >
            <View className={styles.composerHeader}>
              <Text className={styles.composerTitle}>发送反馈</Text>
              <Text className={styles.composerClose} onClick={closeComposer}>✕</Text>
            </View>

            <View className={styles.modeTabs}>
              <View
                className={classnames(styles.modeTab, composerMode === 'fromRecord' && styles.modeTabActive)}
                onClick={() => setComposerMode('fromRecord')}
              >
                📋 训练摘要
              </View>
              <View
                className={classnames(styles.modeTab, composerMode === 'manual' && styles.modeTabActive)}
                onClick={() => setComposerMode('manual')}
              >
                ✏️ 手动编辑
              </View>
            </View>

            <ScrollView className={styles.composerBody} scrollY>
              {composerMode === 'fromRecord' ? (
                <View>
                  <View className={styles.formBlock}>
                    <Text className={styles.formBlockTitle}>第1步：选择训练记录</Text>
                    {records.length > 0 ? (
                      <View className={styles.recordPickerList}>
                        {records.map(r => (
                          <View
                            key={r.id}
                            className={classnames(
                              styles.recordOption,
                              pickedRecordId === r.id && styles.recordOptionActive
                            )}
                            onClick={() => handlePickRecord(r)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text className={styles.roName}>{r.planName}</Text>
                              <Text className={styles.roDate}>
                                {r.date} · {r.attendance.filter(a => a.status === 'present').length}人出勤
                                {r.performances.length > 0 ? ` · ${r.performances.length}条成绩` : ''}
                              </Text>
                            </View>
                            {pickedRecordId === r.id && <Text className={styles.roCheck}>✓</Text>}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View className={styles.emptySmall}>暂无训练记录，请先完成训练</View>
                    )}
                  </View>

                  {pickedRecord && (
                    <View className={styles.formBlock}>
                      <View className={styles.formBlockHeader}>
                        <Text className={styles.formBlockTitle}>第2步：选择接收队员</Text>
                        <View className={styles.selectBtns}>
                          <Text className={styles.selectLink} onClick={selectAllMembers}>全选</Text>
                          <Text className={styles.selectLink} onClick={clearAllMembers}>清空</Text>
                        </View>
                      </View>
                      <View className={styles.memberPickerList}>
                        {recordMembers.map(m => (
                          <View
                            key={m.id}
                            className={classnames(
                              styles.memberOption,
                              selectedMemberIds.includes(m.id) && styles.memberOptionActive
                            )}
                            onClick={() => toggleMember(m.id)}
                          >
                            <View
                              className={classnames(
                                styles.checkBox,
                                selectedMemberIds.includes(m.id) && styles.checkBoxActive
                              )}
                            >
                              {selectedMemberIds.includes(m.id) && '✓'}
                            </View>
                            <Text className={styles.moName}>{m.name}</Text>
                            <Text className={styles.moAge}>{m.age}岁{m.ageGroup}</Text>
                          </View>
                        ))}
                      </View>
                      <Text className={styles.selectedCount}>
                        已选择 {selectedMemberIds.length} / {recordMembers.length}
                      </Text>
                    </View>
                  )}

                  {pickedRecord && (
                    <View className={styles.formBlock}>
                      <Text className={styles.formBlockTitle}>第3步：确认摘要内容（可编辑）</Text>
                      <View
                        className={styles.summaryEditor}
                      >
                        <Input
                          className={styles.summaryInput}
                          placeholder='训练摘要内容...'
                          value={summaryContent}
                          onInput={e => setSummaryContent(e.detail.value)}
                        />
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View>
                  <View className={styles.formBlock}>
                    <Text className={styles.formBlockTitle}>选择反馈类型</Text>
                    <View className={styles.typeOptions}>
                      {(['notice', 'equipment'] as FeedbackType[]).map(t => (
                        <View
                          key={t}
                          className={classnames(
                            styles.typeOption,
                            manualType === t && styles.typeOptionActive,
                            t === 'notice' && styles.typeOptNotice,
                            t === 'equipment' && styles.typeOptEquipment
                          )}
                          onClick={() => setManualType(t)}
                        >
                          <Text className={styles.toIcon}>
                            {t === 'notice' ? '⚠️' : '🎒'}
                          </Text>
                          <Text className={styles.toLabel}>{typeLabels[t]}</Text>
                          {manualType === t && <Text className={styles.toCheck}>✓</Text>}
                        </View>
                      ))}
                    </View>
                  </View>

                  <View className={styles.formBlock}>
                    <Text className={styles.formBlockTitle}>选择队员</Text>
                    <Picker
                      mode='selector'
                      range={members.map(m => `${m.name}（${m.ageGroup}）`)}
                      value={members.findIndex(m => m.id === manualMemberId)}
                      onChange={e => setManualMemberId(members[Number(e.detail.value)].id)}
                    >
                      <View className={styles.formPicker}>
                        <Text className={manualMemberId ? '' : styles.placeholderStyle}>
                          {manualMemberId
                            ? members.find(m => m.id === manualMemberId)?.name
                            : '点击选择队员'}
                        </Text>
                        <Text className={styles.pickerArrow}>▼</Text>
                      </View>
                    </Picker>
                  </View>

                  <View className={styles.formBlock}>
                    <Text className={styles.formBlockTitle}>标题</Text>
                    <Input
                      className={styles.formInput}
                      placeholder={`如：下次训练装备提醒 / 身体恢复注意事项等`}
                      value={manualTitle}
                      onInput={e => setManualTitle(e.detail.value)}
                    />
                  </View>

                  <View className={styles.formBlock}>
                    <Text className={styles.formBlockTitle}>内容</Text>
                    <Input
                      className={styles.formTextarea}
                      placeholder='请输入详细内容...'
                      value={manualContent}
                      onInput={e => setManualContent(e.detail.value)}
                    />
                  </View>
                </View>
              )}
            </ScrollView>

            <View className={styles.composerFooter}>
              <Button className={styles.cancelBtn} onClick={closeComposer}>取消</Button>
              <Button
                className={styles.sendFinalBtn}
                onClick={composerMode === 'fromRecord' ? sendFromRecord : sendManual}
              >
                {composerMode === 'fromRecord'
                  ? `发送摘要（${selectedMemberIds.length}人）`
                  : '确认发送'}
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default FeedbackPage
