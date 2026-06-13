import React from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { recordsData } from '@/data/records'
import { membersData } from '@/data/members'
import { AttendanceRecord } from '@/types'

const attendanceStatusLabels: Record<AttendanceRecord['status'], string> = {
  present: '出勤',
  late: '迟到',
  injured: '受伤',
  absent: '请假'
}

const RecordsPage: React.FC = () => {
  const getMemberName = (memberId: string) => {
    return membersData.find(m => m.id === memberId)?.name || '未知队员'
  }

  const handleAddRecord = () => {
    console.log('[Records] 新增训练记录')
    Taro.showToast({
      title: '开始记录训练',
      icon: 'none'
    })
  }

  const getAttendanceClass = (status: AttendanceRecord['status']) => {
    const map: Record<AttendanceRecord['status'], string> = {
      present: styles.statusPresent,
      late: styles.statusLate,
      injured: styles.statusInjured,
      absent: styles.statusAbsent
    }
    return map[status]
  }

  const getDotClass = (status: AttendanceRecord['status']) => {
    const map: Record<AttendanceRecord['status'], string> = {
      present: styles.dotPresent,
      late: styles.dotLate,
      injured: styles.dotInjured,
      absent: styles.dotAbsent
    }
    return map[status]
  }

  const totalStats = {
    present: recordsData.reduce((sum, r) => sum + r.attendance.filter(a => a.status === 'present').length, 0),
    late: recordsData.reduce((sum, r) => sum + r.attendance.filter(a => a.status === 'late').length, 0),
    injured: recordsData.reduce((sum, r) => sum + r.attendance.filter(a => a.status === 'injured').length, 0),
    absent: recordsData.reduce((sum, r) => sum + r.attendance.filter(a => a.status === 'absent').length, 0)
  }

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
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>训练记录</Text>
          <Button className={styles.actionBtn} onClick={handleAddRecord}>
            + 新增记录
          </Button>
        </View>

        <ScrollView className={styles.recordList}>
          {recordsData.length > 0 ? (
            recordsData.map(record => (
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
              <Text className={styles.emptyText}>暂无训练记录</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

export default RecordsPage
