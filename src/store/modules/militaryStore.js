import { defineStore } from 'pinia'
import { getUnitById } from '../../config/factionConfig.js'
import { useNotificationStore } from './notificationStore.js'
import { useGameStore } from './gameStore.js'
import { useNpcStore } from './npcStore.js'
import { useMessageStore } from './messageStore.js'
import { resolveCombat } from '../../domain/combat/combatService.js'
import { COMBAT_RULE_IDS } from '../../domain/combat/combatConstants.js'
import { applyGeneralBonusesToUnit } from '../../domain/general/generalBonusResolver.js'

const SORTIE_STATUS = {
  OUTBOUND: 'outbound',
  RETURNING: 'returning'
}

const SORTIE_COOLDOWN_MS = 10 * 1000

let sortieTimer = null

const clearSortieTimer = () => {
  if (sortieTimer) {
    clearTimeout(sortieTimer)
    sortieTimer = null
  }
}

const clampDuration = (duration, min, max) => Math.min(max, Math.max(min, duration))

const calculateSortieDurations = (units = [], npcLevel = 1) => {
  const totalUnits = units.reduce((sum, unit) => sum + (unit.count || 0), 0)
  const weightedSpeed = units.reduce((sum, unit) => sum + ((unit.speed || 1) * (unit.count || 0)), 0)
  const averageSpeed = totalUnits > 0 ? (weightedSpeed / totalUnits) : 1
  const speedFactor = 12 / Math.max(4, averageSpeed)
  const levelFactor = 1 + Math.max(0, (npcLevel || 1) - 1) * 0.03
  const outboundDuration = clampDuration(Math.round(18000 * speedFactor * levelFactor), 8000, 45000)
  const returnDuration = clampDuration(Math.round(outboundDuration * 0.8), 6000, 36000)

  return {
    outboundDuration,
    returnDuration
  }
}

export const createDefaultRecruitmentConfig = () => ({
  baseTrainTime: 5 * 60 * 1000,
  speedMultiplier: 1.0
})

export const createDefaultMilitaryState = () => ({
  army: {},
  recruitmentQueue: [],
  recruitmentConfig: createDefaultRecruitmentConfig(),
  sortieTask: null,
  sortieCooldownUntil: 0,
  pendingBattleReport: null
})

export const useMilitaryStore = defineStore('military', {
  state: () => createDefaultMilitaryState(),

  getters: {
    totalArmyCount: (state) => Object.values(state.army).reduce((total, count) => total + count, 0),

    isRecruiting: (state) => state.recruitmentQueue.length > 0,

    getActualTrainTime: (state) => {
      return Math.floor(state.recruitmentConfig.baseTrainTime / state.recruitmentConfig.speedMultiplier)
    },

    isSortieBusy: (state) => Boolean(state.sortieTask),

    isSortieCoolingDown: (state) => state.sortieCooldownUntil > Date.now()
  },

  actions: {
    getMilitarySaveData() {
      return {
        army: this.army,
        recruitmentQueue: this.recruitmentQueue,
        recruitmentConfig: this.recruitmentConfig,
        sortieTask: this.sortieTask,
        sortieCooldownUntil: this.sortieCooldownUntil,
        pendingBattleReport: this.pendingBattleReport
      }
    },

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
      this.sortieTask = militaryState.sortieTask || null
      this.sortieCooldownUntil = militaryState.sortieCooldownUntil || 0
      this.pendingBattleReport = militaryState.pendingBattleReport || null
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

    applyBattleLosses(lossEntries = []) {
      if (!Array.isArray(lossEntries) || lossEntries.length === 0) {
        return
      }

      const nextArmy = { ...this.army }

      lossEntries.forEach((entry) => {
        const unitId = entry.id
        const losses = Math.max(0, entry.count || 0)

        if (!unitId || losses <= 0) {
          return
        }

        const currentCount = nextArmy[unitId] || 0
        const remaining = Math.max(0, currentCount - losses)

        if (remaining <= 0) {
          delete nextArmy[unitId]
        } else {
          nextArmy[unitId] = remaining
        }
      })

      this.army = nextArmy
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

      this.restoreSortieState(now)
    },

    restoreSortieState(now = Date.now()) {
      clearSortieTimer()

      if (this.sortieTask) {
        this.progressSortieTask(now)
        return
      }

      if (this.sortieCooldownUntil > now) {
        sortieTimer = setTimeout(() => {
          this.restoreSortieState()
        }, this.sortieCooldownUntil - now)
        return
      }

      if (this.sortieCooldownUntil) {
        this.sortieCooldownUntil = 0
      }
    },

    queueSortieTimer() {
      clearSortieTimer()

      const now = Date.now()
      if (this.sortieTask) {
        const wait = Math.max(0, this.sortieTask.phaseEndsAt - now)
        sortieTimer = setTimeout(() => {
          this.progressSortieTask()
        }, wait)
        return
      }

      if (this.sortieCooldownUntil > now) {
        sortieTimer = setTimeout(() => {
          this.restoreSortieState()
          useGameStore().saveGame()
        }, this.sortieCooldownUntil - now)
      }
    },

    createSortieTask({ npc, ruleId, selections = {} }) {
      const notificationStore = useNotificationStore()
      const gameStore = useGameStore()

      if (!npc || !ruleId) {
        return { ok: false, reason: 'invalid-target' }
      }

      if (this.sortieTask) {
        notificationStore.addInfoNotification('无法出征', '当前已有部队在外行军')
        return { ok: false, reason: 'busy' }
      }

      if (this.sortieCooldownUntil > Date.now()) {
        notificationStore.addInfoNotification('部队整备中', '部队刚刚归来，请稍后再出征')
        return { ok: false, reason: 'cooldown' }
      }

      const playerFaction = gameStore.userFaction
      if (!playerFaction) {
        notificationStore.addErrorNotification('出兵失败', '请先完成阵营初始化')
        return { ok: false, reason: 'missing-faction' }
      }

      const dispatchedUnits = Object.entries(selections).reduce((result, [unitId, rawCount]) => {
        const count = Number.parseInt(rawCount, 10)
        if (!count || count <= 0) return result
        const available = this.army[unitId] || 0
        if (available < count) return result
        const unit = getUnitById(unitId)
        if (!unit) return result
        result.push(applyGeneralBonusesToUnit(
          { ...unit, count },
          gameStore.generalBonuses
        ))
        return result
      }, [])

      if (dispatchedUnits.length === 0) {
        notificationStore.addWarningNotification('出兵失败', '请至少选择一支部队')
        return { ok: false, reason: 'empty' }
      }

      const requiredUnits = dispatchedUnits.every((unit) => (this.army[unit.id] || 0) >= unit.count)
      if (!requiredUnits) {
        notificationStore.addErrorNotification('出兵失败', '当前军队数量不足，无法完成出征')
        return { ok: false, reason: 'insufficient-units' }
      }

      dispatchedUnits.forEach((unit) => {
        this.consumeUnits(unit.id, unit.count)
      })

      const now = Date.now()
      const { outboundDuration, returnDuration } = calculateSortieDurations(dispatchedUnits, npc.level)
      const actionLabel = ruleId === COMBAT_RULE_IDS.PLUNDER_STRIKE ? '掠夺' : '攻击'

      this.sortieTask = {
        id: `${now}-${Math.random().toString(16).slice(2, 8)}`,
        ruleId,
        actionLabel,
        status: SORTIE_STATUS.OUTBOUND,
        startedAt: now,
        phaseEndsAt: now + outboundDuration,
        outboundDuration,
        returnDuration,
        target: {
          id: npc.id,
          name: npc.name,
          faction: npc.faction,
          level: npc.level
        },
        attacker: {
          faction: playerFaction,
          nickname: gameStore.userNickname || '玩家',
          userUUID: gameStore.userUUID
        },
        dispatchedUnits,
        battleResult: null,
        survivors: [],
        loot: { wood: 0, soil: 0, iron: 0, food: 0 }
      }

      this.pendingBattleReport = null
      this.queueSortieTimer()
      gameStore.saveGame()

      notificationStore.addInfoNotification(
        `${actionLabel}出征`,
        `部队已出发前往 ${npc.name}，预计 ${Math.ceil(outboundDuration / 1000)} 秒后接敌`
      )

      return { ok: true, task: this.sortieTask }
    },

    progressSortieTask(now = Date.now()) {
      if (!this.sortieTask) {
        this.restoreSortieState(now)
        return
      }

      if (this.sortieTask.phaseEndsAt > now) {
        this.queueSortieTimer()
        return
      }

      if (this.sortieTask.status === SORTIE_STATUS.OUTBOUND) {
        this.resolveSortieBattle(now)
        return
      }

      if (this.sortieTask.status === SORTIE_STATUS.RETURNING) {
        this.completeSortieReturn(now)
      }
    },

    resolveSortieBattle(now = Date.now()) {
      if (!this.sortieTask) return

      const task = this.sortieTask
      const notificationStore = useNotificationStore()
      const npcStore = useNpcStore()
      const gameStore = useGameStore()
      const liveNpc = npcStore.getNpcById(task.target.id)
      const defenderNpc = liveNpc || task.target

      const result = resolveCombat({
        ruleId: task.ruleId,
        attackerArmy: {
          faction: task.attacker.faction,
          units: task.dispatchedUnits.map((unit) => ({ ...unit })),
          playerInfo: {
            userUUID: task.attacker.userUUID,
            nickname: task.attacker.nickname
          },
          title: `${task.actionLabel}部队`
        },
        defenderArmy: {
          faction: defenderNpc.faction,
          units: liveNpc?.defenseArmy?.units || [],
          npcInfo: {
            id: defenderNpc.id,
            name: defenderNpc.name
          },
          resources: { ...(liveNpc?.resources || {}) },
          defenderResources: { ...(liveNpc?.resources || {}) },
          title: `${defenderNpc.name}守军`
        }
      })

      npcStore.attackNpc(defenderNpc.id, result)

      const lossesMap = (result.attacker?.losses || []).reduce((map, entry) => {
        map[entry.id] = entry.count || 0
        return map
      }, {})

      const survivors = task.dispatchedUnits
        .map((unit) => ({
          ...unit,
          count: Math.max(0, unit.count - (lossesMap[unit.id] || 0))
        }))
        .filter((unit) => unit.count > 0)

      this.sortieTask = {
        ...task,
        status: SORTIE_STATUS.RETURNING,
        phaseEndsAt: now + task.returnDuration,
        battleResult: result,
        survivors,
        loot: result.details?.plundered || { wood: 0, soil: 0, iron: 0, food: 0 }
      }

      const statusText = result.battleResult === 'ATTACKER_VICTORY' ? '获胜' : '失利'
      notificationStore.addInfoNotification(
        `${task.actionLabel}${statusText}`,
        `${defenderNpc.name} 战斗已结算，部队正在返程`
      )

      gameStore.saveGame()
      this.queueSortieTimer()
    },

    completeSortieReturn(now = Date.now()) {
      if (!this.sortieTask) return

      const task = this.sortieTask
      const gameStore = useGameStore()
      const messageStore = useMessageStore()
      const notificationStore = useNotificationStore()

      task.survivors.forEach((unit) => {
        this.addUnits(unit.id, unit.count)
      })

      const { stored, overflow } = gameStore.storeLootedResources(task.loot || {})
      const finalReport = {
        ...task.battleResult,
        details: {
          ...(task.battleResult?.details || {}),
          storedResources: stored,
          overflowResources: overflow
        }
      }

      messageStore.loadMessages()
      messageStore.addBattleReportMessage({
        task,
        report: finalReport,
        storedResources: stored,
        overflowResources: overflow
      })

      this.pendingBattleReport = finalReport
      this.sortieTask = null
      this.sortieCooldownUntil = now + SORTIE_COOLDOWN_MS
      const earnedExp = Math.max(
        10,
        Math.floor((task.target.level || 1) * 8 + (task.battleResult?.details?.defenderTotalTroops || 0) * 0.05)
      )
      gameStore.addGeneralExperience(earnedExp)

      const storedSummary = Object.values(stored).reduce((sum, amount) => sum + (amount || 0), 0)
      const overflowSummary = Object.values(overflow).reduce((sum, amount) => sum + (amount || 0), 0)
      let message = `${task.target.name} 的出征部队已归来`
      if (storedSummary > 0) {
        message += `，入仓 ${storedSummary} 资源`
      }
      if (overflowSummary > 0) {
        message += `，溢出 ${overflowSummary} 资源`
      }

      notificationStore.addSuccessNotification('部队归来', message)

      gameStore.saveGame()
      this.queueSortieTimer()
    },

    clearPendingBattleReport() {
      this.pendingBattleReport = null
      useGameStore().saveGame()
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

      const baseTrainTime = Math.floor(this.getActualTrainTime * gameStore.generalBonuses.recruitmentTimeMultiplier)
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

    completeRecruitment(taskId, options = {}) {
      const taskIndex = this.recruitmentQueue.findIndex((task) => task.id === taskId)
      if (taskIndex === -1) {
        return
      }

      const task = this.recruitmentQueue[taskIndex]
      this.addUnits(task.unitId, task.count)
      this.recruitmentQueue.splice(taskIndex, 1)

      const notificationStore = useNotificationStore()
      notificationStore.addSuccessNotification(
        options.notificationTitle || '征兵完成',
        options.notificationMessage || `成功征募 ${task.count} 个 ${task.unitName}`
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

      // 测试期先改为金币直接完成，保留旧的 50% 加速逻辑便于后续恢复。
      // task.duration = elapsed + Math.floor(remaining * 0.5)
      //
      // setTimeout(() => {
      //   this.completeRecruitment(taskId)
      // }, Math.floor(remaining * 0.5))
      //
      // const savedMinutes = Math.ceil((remaining - remaining * 0.5) / 60000)
      this.completeRecruitment(taskId, {
        notificationTitle: '征兵立即完成',
        notificationMessage: `消耗 ${accelerationCost} 金币，立即完成 ${task.count} 个 ${task.unitName} 的征募`
      })

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
