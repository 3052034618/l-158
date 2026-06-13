import React, { useState, useMemo } from 'react'
import { View, Text, Input, Button, ScrollView, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import { useAppStore } from '@/store'
import { AgeGroup, TrainingCategory, TrainingItem, TrainingPlan } from '@/types'

const categoryLabels: Record<TrainingCategory, string> = {
  warmup: '热身',
  speed: '速度',
  strength: '力量',
  flexibility: '柔韧',
  recovery: '恢复'
}

const categoryOrder: TrainingCategory[] = ['warmup', 'speed', 'strength', 'flexibility', 'recovery']

const ageGroups: AgeGroup[] = ['U8', 'U10', 'U12', 'U14', 'U16']

const PlansPage: React.FC = () => {
  const plans = useAppStore(s => s.plans)
  const members = useAppStore(s => s.members)
  const addPlan = useAppStore(s => s.addPlan)
  const updatePlan = useAppStore(s => s.updatePlan)
  const deletePlan = useAppStore(s => s.deletePlan)

  const [expandedId, setExpandedId] = useState<string | null>(plans[0]?.id || null)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null)

  const todayPlan = plans.find(p => p.date === '2026-06-13')

  const getMemberCount = (ageGroup: AgeGroup) => {
    return members.filter(m => m.ageGroup === ageGroup).length
  }

  const openNewEditor = () => {
    console.log('[Plans] 打开新增计划')
    const newPlan: TrainingPlan = {
      id: `plan_${Date.now()}`,
      name: '',
      ageGroup: 'U10',
      date: new Date().toISOString().split('T')[0],
      totalDuration: 0,
      coach: '当前教练',
      items: []
    }
    setEditingPlan(newPlan)
    setShowEditor(true)
  }

  const openEditEditor = (plan: TrainingPlan) => {
    console.log('[Plans] 打开编辑计划:', plan.id)
    setEditingPlan(JSON.parse(JSON.stringify(plan)))
    setShowEditor(true)
    setExpandedId(null)
  }

  const handleDeletePlan = (plan: TrainingPlan) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定删除训练计划"${plan.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          deletePlan(plan.id)
          Taro.showToast({ title: '删除成功', icon: 'success' })
        }
      }
    })
  }

  const toggleExpand = (id: string) => {
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
        <View className={styles.headerTop}>
          <Text className={styles.pageTitle}>训练计划</Text>
          <Button className={styles.addPlanBtn} onClick={openNewEditor}>
            + 新建
          </Button>
        </View>
        {todayPlan && (
          <View className={styles.todayCard}>
            <Text className={styles.todayLabel}>今日训练</Text>
            <Text className={styles.todayPlanName}>{todayPlan.name}</Text>
            <View className={styles.todayMeta}>
              <View className={styles.metaItem}>
                <Text>👥</Text>
                <Text>{getMemberCount(todayPlan.ageGroup)}人</Text>
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
        {plans.length > 0 ? (
          plans.map(plan => (
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
                <View className={styles.planActions}>
                  <Button
                    className={styles.editBtn}
                    onClick={(e) => { e.stopPropagation && e.stopPropagation(); openEditEditor(plan) }}
                  >编辑</Button>
                  <Text
                    className={classnames(
                      styles.expandIcon,
                      expandedId === plan.id && styles.expandIconActive
                    )}
                  >
                    ▼
                  </Text>
                </View>
              </View>

              {expandedId === plan.id && (
                <View className={styles.planDetails}>
                  <View className={styles.detailActions}>
                    <Button
                      className={styles.deleteBtn}
                      onClick={() => handleDeletePlan(plan)}
                    >删除计划</Button>
                  </View>
                  <Text className={styles.coachInfo}>
                    教练: {plan.coach} | 共 {plan.items.length} 个训练项目
                  </Text>
                  <View className={styles.itemList}>
                    {plan.items.length > 0 ? (
                      plan.items.map(renderTrainingItem)
                    ) : (
                      <Text className={styles.emptyItems}>暂无训练项目</Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无训练计划，点击右上角新建</Text>
          </View>
        )}
      </View>

      {showEditor && editingPlan && (
        <PlanEditor
          plan={editingPlan}
          isEdit={!!plans.find(p => p.id === editingPlan.id)}
          onClose={() => { setShowEditor(false); setEditingPlan(null) }}
          onSave={(plan) => {
            const exists = plans.find(p => p.id === plan.id)
            if (exists) {
              updatePlan(plan)
              Taro.showToast({ title: '更新成功', icon: 'success' })
            } else {
              addPlan(plan)
              Taro.showToast({ title: '创建成功', icon: 'success' })
            }
            setShowEditor(false)
            setEditingPlan(null)
            setExpandedId(plan.id)
          }}
        />
      )}
    </View>
  )
}

interface PlanEditorProps {
  plan: TrainingPlan
  isEdit: boolean
  onClose: () => void
  onSave: (plan: TrainingPlan) => void
}

const PlanEditor: React.FC<PlanEditorProps> = ({ plan, isEdit, onClose, onSave }) => {
  const [form, setForm] = useState<TrainingPlan>(plan)
  const [addingCategory, setAddingCategory] = useState<TrainingCategory | null>(null)

  const updateForm = (patch: Partial<TrainingPlan>) => {
    setForm(prev => ({ ...prev, ...patch }))
  }

  const updateItem = (itemId: string, patch: Partial<TrainingItem>) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === itemId ? { ...it, ...patch } : it)
    }))
  }

  const removeItem = (itemId: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== itemId)
    }))
  }

  const addNewItem = (category: TrainingCategory) => {
    const newItem: TrainingItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: '',
      category,
      sets: 1,
      duration: 10,
      targetHeartRate: category === 'warmup' || category === 'recovery'
        ? { min: 80, max: 100 }
        : { min: 130, max: 160 },
      description: ''
    }
    setForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
    setAddingCategory(null)
  }

  const calcTotalDuration = () => {
    return form.items.reduce((sum, it) => sum + it.duration, 0)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入计划名称', icon: 'none' })
      return
    }
    if (form.items.length === 0) {
      Taro.showToast({ title: '请添加至少一个训练项目', icon: 'none' })
      return
    }
    const invalidItems = form.items.filter(it => !it.name.trim())
    if (invalidItems.length > 0) {
      Taro.showToast({ title: '请填写所有项目名称', icon: 'none' })
      return
    }
    const finalPlan: TrainingPlan = {
      ...form,
      totalDuration: calcTotalDuration()
    }
    console.log('[PlanEditor] 保存计划:', finalPlan)
    onSave(finalPlan)
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

  return (
    <View className={styles.editorMask} onClick={onClose}>
      <View className={styles.editorPanel} onClick={e => e.stopPropagation && e.stopPropagation()}>
        <View className={styles.editorHeader}>
          <Text className={styles.editorTitle}>
            {isEdit ? '编辑训练计划' : '新建训练计划'}
          </Text>
          <Text className={styles.editorClose} onClick={onClose}>✕</Text>
        </View>

        <ScrollView className={styles.editorBody} scrollY>
          <View className={styles.formSection}>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>计划名称 *</Text>
              <Input
                className={styles.formInput}
                placeholder='如：U10 基础体能训练'
                value={form.name}
                onInput={(e) => updateForm({ name: e.detail.value })}
              />
            </View>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>适用年龄组 *</Text>
              <Picker
                mode='selector'
                range={ageGroups}
                value={ageGroups.indexOf(form.ageGroup)}
                onChange={(e) => updateForm({ ageGroup: ageGroups[Number(e.detail.value)] })}
              >
                <View className={styles.formPicker}>
                  <Text>{form.ageGroup}</Text>
                  <Text className={styles.pickerArrow}>▼</Text>
                </View>
              </Picker>
            </View>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>训练日期 *</Text>
              <Picker
                mode='date'
                value={form.date}
                onChange={(e) => updateForm({ date: e.detail.value })}
              >
                <View className={styles.formPicker}>
                  <Text>{form.date}</Text>
                  <Text className={styles.pickerArrow}>📅</Text>
                </View>
              </Picker>
            </View>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>负责教练</Text>
              <Input
                className={styles.formInput}
                placeholder='请输入教练姓名'
                value={form.coach}
                onInput={(e) => updateForm({ coach: e.detail.value })}
              />
            </View>
          </View>

          <View className={styles.formSection}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitleInner}>
                训练项目 ({form.items.length}个，约{calcTotalDuration()}分钟)
              </Text>
            </View>

            {form.items.length > 0 && (
              <View className={styles.editorItems}>
                {categoryOrder.map(cat => {
                  const catItems = form.items.filter(it => it.category === cat)
                  if (catItems.length === 0) return null
                  return (
                    <View key={cat} className={styles.catGroup}>
                      <View className={classnames(styles.catHeader, getCategoryTagClass(cat))}>
                        <Text>{categoryLabels[cat]} (×{catItems.length})</Text>
                      </View>
                      {catItems.map(item => (
                        <View
                          key={item.id}
                          className={classnames(styles.editorItemCard, getCategoryClass(item.category))}
                        >
                          <View className={styles.editorItemHeader}>
                            <Input
                              className={styles.editorItemName}
                              placeholder='项目名称，如：动态热身'
                              value={item.name}
                              onInput={(e) => updateItem(item.id, { name: e.detail.value })}
                            />
                            <Text
                              className={styles.removeItemBtn}
                              onClick={() => removeItem(item.id)}
                            >删除</Text>
                          </View>
                          <View className={styles.editorItemParams}>
                            <View className={styles.paramCol}>
                              <Text className={styles.paramLabel}>组数</Text>
                              <Input
                                className={styles.paramInput}
                                type='number'
                                value={String(item.sets)}
                                onInput={(e) => updateItem(item.id, { sets: Math.max(1, Number(e.detail.value) || 1) })}
                              />
                            </View>
                            <View className={styles.paramCol}>
                              <Text className={styles.paramLabel}>时长(分)</Text>
                              <Input
                                className={styles.paramInput}
                                type='number'
                                value={String(item.duration)}
                                onInput={(e) => updateItem(item.id, { duration: Math.max(1, Number(e.detail.value) || 1) })}
                              />
                            </View>
                            <View className={styles.paramCol}>
                              <Text className={styles.paramLabel}>心率最低</Text>
                              <Input
                                className={styles.paramInput}
                                type='number'
                                value={String(item.targetHeartRate?.min || '')}
                                onInput={(e) => updateItem(item.id, {
                                  targetHeartRate: {
                                    min: Number(e.detail.value) || 0,
                                    max: item.targetHeartRate?.max || 0
                                  }
                                })}
                              />
                            </View>
                            <View className={styles.paramCol}>
                              <Text className={styles.paramLabel}>心率最高</Text>
                              <Input
                                className={styles.paramInput}
                                type='number'
                                value={String(item.targetHeartRate?.max || '')}
                                onInput={(e) => updateItem(item.id, {
                                  targetHeartRate: {
                                    min: item.targetHeartRate?.min || 0,
                                    max: Number(e.detail.value) || 0
                                  }
                                })}
                              />
                            </View>
                          </View>
                          <Input
                            className={styles.editorItemDesc}
                            placeholder='训练说明（选填）：动作要求、间歇时间等'
                            value={item.description || ''}
                            onInput={(e) => updateItem(item.id, { description: e.detail.value })}
                          />
                        </View>
                      ))}
                    </View>
                  )
                })}
              </View>
            )}

            <View className={styles.addItemSection}>
              {addingCategory === null ? (
                <View className={styles.addItemBtns}>
                  {categoryOrder.map(cat => (
                    <Button
                      key={cat}
                      className={classnames(styles.addCatBtn, getCategoryTagClass(cat))}
                      onClick={() => addNewItem(cat)}
                    >
                      + {categoryLabels[cat]}
                    </Button>
                  ))}
                </View>
              ) : (
                <View className={styles.addItemConfirm}>
                  <Text>添加{categoryLabels[addingCategory]}项目？</Text>
                  <Button className={styles.confirmYes} onClick={() => addNewItem(addingCategory)}>确认</Button>
                  <Button className={styles.confirmNo} onClick={() => setAddingCategory(null)}>取消</Button>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View className={styles.editorFooter}>
          <Button className={styles.cancelBtn} onClick={onClose}>取消</Button>
          <Button className={styles.saveBtn} onClick={handleSave}>保存计划</Button>
        </View>
      </View>
    </View>
  )
}

export default PlansPage
