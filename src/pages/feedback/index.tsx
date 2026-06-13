import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { feedbackData } from '@/data/feedback'
import { FeedbackType, FeedbackItem } from '@/types'

const typeFilters: (FeedbackType | 'all')[] = ['all', 'summary', 'notice', 'equipment']

const typeLabels: Record<FeedbackType | 'all', string> = {
  all: '全部',
  summary: '训练摘要',
  notice: '注意事项',
  equipment: '装备提醒'
}

const FeedbackPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<FeedbackType | 'all'>('all')

  const unreadCount = useMemo(() => {
    return feedbackData.filter(f => !f.isRead).length
  }, [])

  const filteredFeedback = useMemo(() => {
    if (selectedType === 'all') return feedbackData
    return feedbackData.filter(f => f.type === selectedType)
  }, [selectedType])

  const getTypeCardClass = (type: FeedbackType) => {
    const map: Record<FeedbackType, string> = {
      summary: styles.typeSummary,
      notice: styles.typeNotice,
      equipment: styles.typeEquipment
    }
    return map[type]
  }

  const getTypeTagClass = (type: FeedbackType) => {
    const map: Record<FeedbackType, string> = {
      summary: styles.tagSummary,
      notice: styles.tagNotice,
      equipment: styles.tagEquipment
    }
    return map[type]
  }

  const handleFeedbackClick = (item: FeedbackItem) => {
    console.log('[Feedback] 查看反馈:', item.id)
    Taro.showModal({
      title: item.title,
      content: item.content,
      showCancel: false,
      confirmText: '知道了'
    })
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>家长反馈</Text>
        <View className={styles.headerStats}>
          {unreadCount > 0 && (
            <View className={styles.unreadBadge}>
              {unreadCount} 条未读
            </View>
          )}
          <Text className={styles.headerDesc}>向家长同步训练信息</Text>
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
            <Text className={styles.emptyText}>暂无反馈信息</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default FeedbackPage
