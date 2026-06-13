import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { membersData } from '@/data/members'
import { AgeGroup, Member } from '@/types'

const ageGroups: (AgeGroup | 'all')[] = ['all', 'U8', 'U10', 'U12', 'U14', 'U16']

const ageGroupLabels: Record<AgeGroup | 'all', string> = {
  all: '全部',
  U8: 'U8组',
  U10: 'U10组',
  U12: 'U12组',
  U14: 'U14组',
  U16: 'U16组'
}

const statusLabels: Record<Member['status'], string> = {
  active: '在训',
  injured: '受伤',
  absent: '请假'
}

const MembersPage: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<AgeGroup | 'all'>('all')

  const filteredMembers = useMemo(() => {
    if (selectedGroup === 'all') return membersData
    return membersData.filter(m => m.ageGroup === selectedGroup)
  }, [selectedGroup])

  const stats = useMemo(() => {
    const total = membersData.length
    const active = membersData.filter(m => m.status === 'active').length
    const injured = membersData.filter(m => m.status === 'injured').length
    const absent = membersData.filter(m => m.status === 'absent').length
    return { total, active, injured, absent }
  }, [])

  const handleMemberClick = (member: Member) => {
    console.log('[Members] 点击队员:', member.name)
    Taro.showToast({
      title: `查看 ${member.name} 详情`,
      icon: 'none'
    })
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>队员管理</Text>
        <ScrollView
          className={styles.filterScroll}
          scrollX
          enhanced
          showScrollbar={false}
        >
          <View className={styles.filterContainer}>
            {ageGroups.map(group => (
              <View
                key={group}
                className={classnames(
                  styles.filterItem,
                  selectedGroup === group && styles.filterActive
                )}
                onClick={() => setSelectedGroup(group)}
              >
                {ageGroupLabels[group]}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className={styles.statsBar}>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{stats.total}</Text>
          <Text className={styles.statLabel}>总人数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{stats.active}</Text>
          <Text className={styles.statLabel}>在训</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{stats.injured}</Text>
          <Text className={styles.statLabel}>受伤</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{stats.absent}</Text>
          <Text className={styles.statLabel}>请假</Text>
        </View>
      </View>

      <ScrollView className={styles.memberList}>
        {filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <View
              key={member.id}
              className={styles.memberCard}
              onClick={() => handleMemberClick(member)}
            >
              <Image
                className={styles.avatar}
                src={member.avatar}
                mode='aspectFill'
              />
              <View className={styles.memberInfo}>
                <View className={styles.memberNameRow}>
                  <Text className={styles.memberName}>{member.name}</Text>
                  <View
                    className={classnames(
                      styles.genderTag,
                      member.gender === '男' ? styles.genderMale : styles.genderFemale
                    )}
                  >
                    {member.gender === '男' ? '♂' : '♀'}
                  </View>
                  <View className={styles.ageGroupTag}>{member.ageGroup}</View>
                </View>
                <View className={styles.memberMeta}>
                  <Text className={styles.metaItem}>{member.age}岁</Text>
                  <View
                    className={classnames(
                      styles.statusTag,
                      member.status === 'active' && styles.statusActive,
                      member.status === 'injured' && styles.statusInjured,
                      member.status === 'absent' && styles.statusAbsent
                    )}
                  >
                    {statusLabels[member.status]}
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🏃</Text>
            <Text className={styles.emptyText}>暂无该组队员</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default MembersPage
