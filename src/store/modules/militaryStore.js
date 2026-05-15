import { defineStore } from 'pinia'
import { getUnitById } from '../../config/factionConfig.js'
import { useNotificationStore } from './notificationStore.js'
import { useGameStore } from './gameStore.js'

export const createDefaultRecruitmentConfig = () => ({
  baseTrainTime: 5 * 60 * 1000,
  speedMultiplier: 1.0
})

export const createDefaultMilitaryState = () => ({
  army: {},
  recruitmentQueue: [],
  recruitmentConfig: createDefaultRecruitmentConfig()
})

export const useMilitaryStore = defineStore('military', {
  state: () => createDefaultMilitaryState(),

  getters: {
    totalArmyCount: (state) => Object.values(state.army).reduce((total, count) => total + count, 0),

    isRecruiting: (state) => state.recruitmentQueue.length > 0,

    getActualTrainTime: (state) => {
      return Math.floor(state.recruitmentConfig.baseTrainTime / state.recruitmentConfig.speedMultiplier)
    }
  },

  actions: {
    setArmy(army) {
      this.army = { ...army }
    },

    setMilitaryState(militaryState = {}) {
      this.army = militaryState.army ? { ...militaryState.army } : {}
      this.recruitmentQueue = Array.isArray(militaryState.recruitmentQueue)
        ? [...militaryState.recruitmentQueue]
        : []
      this.recruitmentConfig = {
        ...createDefaultRecruitmentConfig(),
        ...(militaryState.recruitmentConfig || {})
      }
    },

    resetMilitaryState() {
      this.$patch(createDefaultMilitaryState())
    },

    consumeUnits(unitId, count) {
      if (!unitId || count <= 0) {
        return false
      }

      const currentCount = this.army[unitId] || 0
      if (currentCount < count) {
        return false
      }

      const nextCount = currentCount - count
      if (nextCount <= 0) {
        const { [unitId]: _, ...restArmy } = this.army
        this.army = restArmy
      } else {
        this.army = {
          ...this.army,
          [unitId]: nextCount
        }
      }

      return true
    },

    addUnits(unitId, count) {
      if (!unitId || count <= 0) {
        return
      }

      this.army = {
        ...this.army,
        [unitId]: (this.army[unitId] || 0) + count
      }
    },

    restoreRecruitmentTimers() {
      const now = Date.now()

      this.recruitmentQueue.forEach((task) => {
        const elapsed = now - task.startTime
        const remaining = task.duration - elapsed

        if (remaining <= 0) {
          this.completeRecruitment(task.id)
        } else {
          setTimeout(() => {
            this.completeRecruitment(task.id)
          }, remaining)
        }
      })
    },

    recruitUnits(unitId, count) {
      const unit = getUnitById(unitId)
      const notificationStore = useNotificationStore()
      const gameStore = useGameStore()

      if (!unit) {
        notificationStore.addErrorNotification('征兵失败', '未找到指定兵种')
        return false
      }

      const totalCost = {}
      Object.keys(unit.cost).forEach((resource) => {
        totalCost[resource] = unit.cost[resource] * count
      })

      const hasEnoughResources = Object.keys(totalCost).every((resource) => {
        return gameStore.resources[resource] >= totalCost[resource]
      })

      if (!hasEnoughResources) {
        notificationStore.addResourceInsufficientNotification(`征募${unit.name}`)
        return false
      }

      Object.keys(totalCost).forEach((resource) => {
        gameStore.resources[resource] -= totalCost[resource]
      })

      const baseTrainTime = this.getActualTrainTime
      const trainTime = baseTrainTime * count
      const startTime = Date.now()

      const recruitmentTask = {
        id: Date.now() + Math.random(),
        unitId,
        unitName: unit.name,
        count,
        startTime,
        duration: trainTime,
        totalCost
      }

      this.recruitmentQueue.push(recruitmentTask)

      setTimeout(() => {
        this.completeRecruitment(recruitmentTask.id)
      }, trainTime)

      const totalMinutes = Math.ceil(trainTime / 60000)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      const timeText = hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`

      notificationStore.addSuccessNotification(
        '征兵开始',
        `开始征募 ${count} 个 ${unit.name}，预计 ${timeText} 完成`
      )

      gameStore.saveGame()
      return true
    },

    completeRecruitment(taskId) {
      const taskIndex = this.recruitmentQueue.findIndex((task) => task.id === taskId)
      if (taskIndex === -1) {
        return
      }

      const task = this.recruitmentQueue[taskIndex]
      this.addUnits(task.unitId, task.count)
      this.recruitmentQueue.splice(taskIndex, 1)

      const notificationStore = useNotificationStore()
      notificationStore.addSuccessNotification(
        '征兵完成',
        `成功征募 ${task.count} 个 ${task.unitName}`
      )

      useGameStore().saveGame()
    },

    accelerateRecruitment(taskId) {
      const taskIndex = this.recruitmentQueue.findIndex((task) => task.id === taskId)
      const notificationStore = useNotificationStore()
      const gameStore = useGameStore()

      if (taskIndex === -1) {
        notificationStore.addErrorNotification('加速失败', '未找到指定的征兵任务')
        return false
      }

      const task = this.recruitmentQueue[taskIndex]
      const now = Date.now()
      const elapsed = now - task.startTime
      const remaining = task.duration - elapsed

      if (remaining <= 0) {
        notificationStore.addInfoNotification('无需加速', '征兵即将完成，无需加速')
        return false
      }

      const remainingMinutes = Math.ceil(remaining / 60000)
      const accelerationCost = Math.max(10, remainingMinutes * 10)

      if (gameStore.coins < accelerationCost) {
        notificationStore.addErrorNotification(
          '金币不足',
          `加速需要 ${accelerationCost} 金币，当前仅有 ${gameStore.coins} 金币`
        )
        return false
      }

      gameStore.coins -= accelerationCost
      task.duration = elapsed + Math.floor(remaining * 0.5)

      setTimeout(() => {
        this.completeRecruitment(taskId)
      }, Math.floor(remaining * 0.5))

      const savedMinutes = Math.ceil((remaining - remaining * 0.5) / 60000)
      notificationStore.addSuccessNotification(
        '征兵加速成功',
        `消耗 ${accelerationCost} 金币，节省 ${savedMinutes} 分钟训练时间`
      )

      gameStore.saveGame()
      return true
    },

    canRecruit(unitId, count) {
      try {
        const unit = getUnitById(unitId)
        if (!unit) {
          console.error('未找到兵种:', unitId)
          return false
        }

        const gameStore = useGameStore()
        const totalCost = {}
        Object.keys(unit.cost).forEach((resource) => {
          totalCost[resource] = unit.cost[resource] * count
        })

        return Object.keys(totalCost).every((resource) => {
          return gameStore.resources[resource] >= totalCost[resource]
        })
      } catch (error) {
        console.error('canRecruit 方法执行错误:', error)
        return false
      }
    },

    getMaxRecruitableCount(unitId) {
      try {
        const unit = getUnitById(unitId)
        if (!unit) {
          console.error('未找到兵种:', unitId)
          return 0
        }

        const gameStore = useGameStore()
        let maxCount = Infinity

        Object.keys(unit.cost).forEach((resource) => {
          const resourceCost = unit.cost[resource]
          if (resourceCost > 0) {
            const possibleCount = Math.floor(gameStore.resources[resource] / resourceCost)
            maxCount = Math.min(maxCount, possibleCount)
          }
        })

        return maxCount === Infinity ? 0 : maxCount
      } catch (error) {
        console.error('getMaxRecruitableCount 方法执行错误:', error)
        return 0
      }
    }
  }
})
