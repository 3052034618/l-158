import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { plansData } from '@/data/plans'
import { TrainingCategory, TrainingItem } from '@/types'

const categoryLabels: Record<TrainingCategory, string> = {
  warmup: '热身',
  speed: '速度',
  strength: '力量',
  flexibility: '柔韧',
  recovery: '恢复'
}

const PlansPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(plansData[0]?.id || null)
  const todayPlan = plansData.find(p => p.date === '2026-06-13')

  const toggleExpand = (id: string) => {
    console.log('[Plans] 切换展开:', id)
    setExpandedId(expandedId === id ? null : id)
  }

  const getCategoryClass = (category: TrainingCategory) => {
    const map: Record<TrainingCategory, string> = {
      warmup: styles.itemWarmup,
      speed: styles.itemSpeed,
      strength: styles.itemStrength,
      flexibility: styles.itemFlexibility,
      recovery: styles.itemRecovery
    }
    return map[category]
  }

  const getCategoryTagClass = (category: TrainingCategory) => {
    const map: Record<TrainingCategory, string> = {
      warmup: styles.categoryWarmup,
      speed: styles.categorySpeed,
      strength: styles.categoryStrength,
      flexibility: styles.categoryFlexibility,
      recovery: styles.categoryRecovery
    }
    return map[category]
  }

  const renderTrainingItem = (item: TrainingItem) => (
    <View
      key={item.id}
      className={classnames(styles.itemCard, getCategoryClass(item.category))}
    >
      <View className={styles.itemHeader}>
        <Text className={styles.itemName}>{item.name}</Text>
        <View className={classnames(styles.categoryTag, getCategoryTagClass(item.category))}>
          {categoryLabels[item.category]}
        </View>
      </View>
      <View className={styles.itemParams}>
        <View className={styles.paramItem}>
          <Text>组数:</Text>
          <Text className={styles.paramValue}>{item.sets}组</Text>
        </View>
        <View className={styles.paramItem}>
          <Text>时长:</Text>
          <Text className={styles.paramValue}>{item.duration}分钟</Text>
        </View>
        {item.targetHeartRate && (
          <View className={styles.paramItem}>
            <Text>目标心率:</Text>
            <Text className={classnames(styles.paramValue, styles.heartRate)}>
              {item.targetHeartRate.min}-{item.targetHeartRate.max} bpm
            </Text>
          </View>
        )}
      </View>
      {item.description && (
        <Text className={styles.itemDesc}>{item.description}</Text>
      )}
    </View>
  )

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>训练计划</Text>
        {todayPlan && (
          <View className={styles.todayCard}>
            <Text className={styles.todayLabel}>今日训练</Text>
            <Text className={styles.todayPlanName}>{todayPlan.name}</Text>
            <View className={styles.todayMeta}>
              <View className={styles.metaItem}>
                <Text>👤</Text>
                <Text>{todayPlan.coach}</Text>
              </View>
              <View className={styles.metaItem}>
                <Text>⏱</Text>
                <Text>{todayPlan.totalDuration}分钟</Text>
              </View>
              <View className={styles.metaItem}>
                <Text>📋</Text>
                <Text>{todayPlan.items.length}个项目</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <Text className={styles.sectionTitle}>全部训练计划</Text>

      <View className={styles.planList}>
        {plansData.length > 0 ? (
          plansData.map(plan => (
            <View key={plan.id} className={styles.planCard}>
              <View
                className={styles.planHeader}
                onClick={() => toggleExpand(plan.id)}
              >
                <View className={styles.planInfo}>
                  <Text className={styles.planName}>{plan.name}</Text>
                  <View className={styles.planMeta}>
                    <View className={styles.ageTag}>{plan.ageGroup}</View>
                    <Text className={styles.planDate}>{plan.date}</Text>
                    <Text className={styles.planDuration}>{plan.totalDuration}分钟</Text>
                  </View>
                </View>
                <Text
                  className={classnames(
                    styles.expandIcon,
                    expandedId === plan.id && styles.expandIconActive
                  )}
                >
                  ▼
                </Text>
              </View>

              {expandedId === plan.id && (
                <View className={styles.planDetails}>
                  <Text className={styles.coachInfo}>
                    教练: {plan.coach} | 共 {plan.items.length} 个训练项目
                  </Text>
                  <View className={styles.itemList}>
                    {plan.items.map(renderTrainingItem)}
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无训练计划</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default PlansPage
