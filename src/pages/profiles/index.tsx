import React, { useState, useMemo } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { profilesData } from '@/data/profiles'
import { membersData } from '@/data/members'
import { MemberProfile } from '@/types'

const ProfilesPage: React.FC = () => {
  const availableMembers = useMemo(() => {
    const profileMemberIds = profilesData.map(p => p.memberId)
    return membersData.filter(m => profileMemberIds.includes(m.id))
  }, [])

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    availableMembers[0]?.id || ''
  )

  const selectedMember = useMemo(() => {
    return membersData.find(m => m.id === selectedMemberId)
  }, [selectedMemberId])

  const profile: MemberProfile | undefined = useMemo(() => {
    return profilesData.find(p => p.memberId === selectedMemberId)
  }, [selectedMemberId])

  const handleChangeMember = () => {
    console.log('[Profiles] 切换队员')
    const currentIndex = availableMembers.findIndex(m => m.id === selectedMemberId)
    const nextIndex = (currentIndex + 1) % availableMembers.length
    setSelectedMemberId(availableMembers[nextIndex].id)
    Taro.showToast({
      title: `切换至 ${availableMembers[nextIndex].name}`,
      icon: 'none'
    })
  }

  const calculateTrend = (values: number[], isLowerBetter: boolean = false) => {
    if (values.length < 2) return { trend: 0, text: '-' }
    const latest = values[values.length - 1]
    const previous = values[values.length - 2]
    const diff = latest - previous
    const trend = isLowerBetter ? -diff : diff
    return {
      trend,
      text: diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)
    }
  }

  if (!selectedMember || !profile) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📊</Text>
          <Text className={styles.emptyText}>暂无体测数据</Text>
        </View>
      </View>
    )
  }

  const latestBody = profile.bodyMetrics[profile.bodyMetrics.length - 1]
  const latestFitness = profile.fitnessTests[profile.fitnessTests.length - 1]

  const heightTrend = calculateTrend(profile.bodyMetrics.map(b => b.height))
  const weightTrend = calculateTrend(profile.bodyMetrics.map(b => b.weight))
  const shuttleTrend = calculateTrend(profile.fitnessTests.map(f => f.shuttleRun), true)
  const jumpTrend = calculateTrend(profile.fitnessTests.map(f => f.standingJump))
  const coreTrend = calculateTrend(profile.fitnessTests.map(f => f.coreStrength))

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>体测档案</Text>
        <View className={styles.memberSelector}>
          <Image
            className={styles.memberAvatar}
            src={selectedMember.avatar}
            mode='aspectFill'
          />
          <View className={styles.memberInfo}>
            <Text className={styles.memberName}>{selectedMember.name}</Text>
            <Text className={styles.memberAge}>
              {selectedMember.age}岁 · {selectedMember.ageGroup}
            </Text>
          </View>
          <Button className={styles.changeBtn} onClick={handleChangeMember}>
            切换
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📏 身体指标</Text>
        <View className={styles.cardGrid}>
          <View className={styles.metricCard}>
            <View className={styles.metricHeader}>
              <Text className={styles.metricName}>
                <Text className={styles.metricIcon}>📐</Text>
                身高
              </Text>
              <View
                className={classnames(
                  styles.metricTrend,
                  heightTrend.trend > 0 && styles.trendUp
                )}
              >
                {heightTrend.trend > 0 ? '↑' : heightTrend.trend < 0 ? '↓' : '→'}
                {heightTrend.text} cm
              </View>
            </View>
            <Text className={styles.currentValue}>
              {latestBody.height}
              <Text className={styles.currentValueSmall}>cm</Text>
            </Text>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${Math.min((latestBody.height / 200) * 100, 100)}%` }} />
            </View>
            <Text className={styles.metricDesc}>近三次测量</Text>
            <View className={styles.historyList}>
              {profile.bodyMetrics.slice(-3).map((b, idx) => (
                <View key={idx} className={styles.historyItem}>
                  <Text className={styles.historyDate}>{b.date}</Text>
                  <Text className={styles.historyValue}>{b.height}cm</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.metricCard}>
            <View className={styles.metricHeader}>
              <Text className={styles.metricName}>
                <Text className={styles.metricIcon}>⚖️</Text>
                体重
              </Text>
              <View
                className={classnames(
                  styles.metricTrend,
                  weightTrend.trend > 0 && styles.trendUp
                )}
              >
                {weightTrend.trend > 0 ? '↑' : weightTrend.trend < 0 ? '↓' : '→'}
                {weightTrend.text} kg
              </View>
            </View>
            <Text className={styles.currentValue}>
              {latestBody.weight}
              <Text className={styles.currentValueSmall}>kg</Text>
            </Text>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${Math.min((latestBody.weight / 80) * 100, 100)}%` }} />
            </View>
            <Text className={styles.metricDesc}>近三次测量</Text>
            <View className={styles.historyList}>
              {profile.bodyMetrics.slice(-3).map((b, idx) => (
                <View key={idx} className={styles.historyItem}>
                  <Text className={styles.historyDate}>{b.date}</Text>
                  <Text className={styles.historyValue}>{b.weight}kg</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🏃 体能测试</Text>
        <View className={styles.cardGrid}>
          <View className={styles.metricCard}>
            <View className={styles.metricHeader}>
              <Text className={styles.metricName}>
                <Text className={styles.metricIcon}>🔄</Text>
                折返跑
              </Text>
              <View
                className={classnames(
                  styles.metricTrend,
                  shuttleTrend.trend > 0 && styles.trendGood
                )}
              >
                {shuttleTrend.trend > 0 ? '进步' : shuttleTrend.trend < 0 ? '退步' : '持平'}
                {Math.abs(shuttleTrend.trend).toFixed(1)}s
              </View>
            </View>
            <Text className={styles.currentValue}>
              {latestFitness.shuttleRun}
              <Text className={styles.currentValueSmall}>秒</Text>
            </Text>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${Math.min(((20 - latestFitness.shuttleRun) / 12) * 100, 100)}%` }} />
            </View>
            <Text className={styles.metricDesc}>近三次测试（用时越短越好）</Text>
            <View className={styles.historyList}>
              {profile.fitnessTests.slice(-3).map((f, idx) => (
                <View key={idx} className={styles.historyItem}>
                  <Text className={styles.historyDate}>{f.date}</Text>
                  <Text className={styles.historyValue}>{f.shuttleRun}s</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.metricCard}>
            <View className={styles.metricHeader}>
              <Text className={styles.metricName}>
                <Text className={styles.metricIcon}>🦘</Text>
                立定跳远
              </Text>
              <View
                className={classnames(
                  styles.metricTrend,
                  jumpTrend.trend > 0 && styles.trendUp
                )}
              >
                {jumpTrend.trend > 0 ? '↑' : jumpTrend.trend < 0 ? '↓' : '→'}
                {jumpTrend.text} cm
              </View>
            </View>
            <Text className={styles.currentValue}>
              {latestFitness.standingJump}
              <Text className={styles.currentValueSmall}>cm</Text>
            </Text>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${Math.min((latestFitness.standingJump / 250) * 100, 100)}%` }} />
            </View>
            <Text className={styles.metricDesc}>近三次测试</Text>
            <View className={styles.historyList}>
              {profile.fitnessTests.slice(-3).map((f, idx) => (
                <View key={idx} className={styles.historyItem}>
                  <Text className={styles.historyDate}>{f.date}</Text>
                  <Text className={styles.historyValue}>{f.standingJump}cm</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.metricCard}>
            <View className={styles.metricHeader}>
              <Text className={styles.metricName}>
                <Text className={styles.metricIcon}>💪</Text>
                核心力量
              </Text>
              <View
                className={classnames(
                  styles.metricTrend,
                  coreTrend.trend > 0 && styles.trendUp
                )}
              >
                {coreTrend.trend > 0 ? '↑' : coreTrend.trend < 0 ? '↓' : '→'}
                {coreTrend.text} 次
              </View>
            </View>
            <Text className={styles.currentValue}>
              {latestFitness.coreStrength}
              <Text className={styles.currentValueSmall}>次/分钟</Text>
            </Text>
            <View className={styles.progressBar}>
              <View className={styles.progressFill} style={{ width: `${Math.min((latestFitness.coreStrength / 100) * 100, 100)}%` }} />
            </View>
            <Text className={styles.metricDesc}>近三次测试（仰卧起坐）</Text>
            <View className={styles.historyList}>
              {profile.fitnessTests.slice(-3).map((f, idx) => (
                <View key={idx} className={styles.historyItem}>
                  <Text className={styles.historyDate}>{f.date}</Text>
                  <Text className={styles.historyValue}>{f.coreStrength}次</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default ProfilesPage
