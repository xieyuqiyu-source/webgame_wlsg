import { defineStore } from 'pinia'
import { getFactionUnits, UNIT_TYPES } from '@/config/factionConfig.js'
import { useGameStore } from './gameStore.js'

const NPC_RECOVERY_DURATION = 30 * 60 * 1000

const cloneResources = (resources = {}) => ({
  wood: Math.max(0, Math.floor(resources.wood || 0)),
  soil: Math.max(0, Math.floor(resources.soil || 0)),
  iron: Math.max(0, Math.floor(resources.iron || 0)),
  food: Math.max(0, Math.floor(resources.food || 0))
})

const cloneArmy = (army = {}) => ({
  faction: army.faction || 'unknown',
  units: Array.isArray(army.units)
    ? army.units.map((unit) => ({ ...unit, count: Math.max(0, Math.floor(unit.count || 0)) }))
    : []
})

const syncScoutData = (npc) => {
  if (!npc?.scoutData) return
  npc.scoutData.units = (npc.defenseArmy?.units || []).map((unit) => ({
    id: unit.id,
    name: unit.name,
    count: unit.count
  }))
  npc.scoutData.totalUnits = (npc.defenseArmy?.units || []).reduce((total, unit) => total + (unit.count || 0), 0)
  npc.scoutData.unitTypes = (npc.defenseArmy?.units || []).length
}

const normalizeNpc = (npc) => {
  const normalizedResources = cloneResources(npc.resources || {})
  const normalizedArmy = cloneArmy(npc.defenseArmy || {})

  return {
    ...npc,
    resources: normalizedResources,
    defenderResources: cloneResources(npc.defenderResources || normalizedResources),
    defenseArmy: normalizedArmy,
    maxResources: cloneResources(npc.maxResources || normalizedResources),
    maxDefenseArmy: cloneArmy(npc.maxDefenseArmy || normalizedArmy),
    recoveryState: npc.recoveryState || null
  }
}

export const useNpcStore = defineStore('npc', {
  state: () => ({
    //=== npcs NPC城池列表
    npcs: [],
    //=== lastGeneratedTime 上次生成时间
    lastGeneratedTime: 0,
    //=== generationInterval 生成间隔（1小时 = 3600000毫秒）
    generationInterval: 3600000,
    //=== manualRefreshCost 手动刷新消耗金币
    manualRefreshCost: 50,
    //=== isInitialized 是否已初始化
    isInitialized: false
  }),

  getters: {
    //=== 根据阵营筛选NPC
    getNpcsByFaction: (state) => (faction) => {
      if (faction === 'all') return state.npcs
      return state.npcs.filter(npc => npc.faction === faction)
    },

    //=== 获取指定ID的NPC
    getNpcById: (state) => (id) => {
      return state.npcs.find(npc => npc.id === id)
    },

    //=== 检查是否需要重新生成NPC - 接受currentTime参数以触发响应式更新
    needsRegeneration: (state) => (currentTime = Date.now()) => {
      return (currentTime - state.lastGeneratedTime) >= state.generationInterval
    },

    //=== 获取下次刷新剩余时间（毫秒）- 接受currentTime参数以触发响应式更新
    timeUntilNextRefresh: (state) => (currentTime = Date.now()) => {
      const elapsed = currentTime - state.lastGeneratedTime
      return Math.max(0, state.generationInterval - elapsed)
    },

    //=== 获取已侦查的NPC数量
    scoutedNpcsCount: (state) => {
      return state.npcs.filter(npc => npc.scoutedAt).length
    },

    //=== 获取可攻击的NPC数量（已侦查的）
    attackableNpcsCount: (state) => {
      return state.npcs.filter(npc => npc.scoutedAt && npc.scoutData).length
    }
  },

  actions: {
    getNpcSaveData() {
      return {
        npcs: this.npcs,
        lastGeneratedTime: this.lastGeneratedTime,
        generationInterval: this.generationInterval,
        manualRefreshCost: this.manualRefreshCost,
        isInitialized: this.isInitialized
      }
    },

    applyNpcSaveData(data = {}) {
      this.npcs = Array.isArray(data.npcs) ? data.npcs.map(normalizeNpc) : []
      this.lastGeneratedTime = data.lastGeneratedTime || 0
      this.generationInterval = data.generationInterval || 3600000
      this.manualRefreshCost = data.manualRefreshCost || 50
      this.isInitialized = Boolean(data.isInitialized)
    },

    //=== initializeNpcs 初始化NPC数据
    async initializeNpcs() {
      if (this.isInitialized) return

      if (!this.npcs.length || this.needsRegeneration(Date.now())) {
        // 如果没有恢复到数据或需要重新生成，则生成新数据
        this.generateNpcs()
      } else {
        this.progressNpcRecovery(Date.now())
        this.isInitialized = true
      }
    },

    //=== generateNpcs 生成NPC城池数据
    generateNpcs(isManualRefresh = false) {
      const factions = ['wei', 'shu', 'wu']
      const cityNames = [
        '洛阳', '长安', '成都', '建业', '襄阳', '江陵', '合肥', '濮阳', '徐州', '荆州',
        '益州', '扬州', '兖州', '青州', '冀州', '并州', '凉州', '交州', '幽州', '豫州',
        '龙城', '虎寨', '凤凰城', '麒麟堡', '玄武关', '朱雀台', '青龙岭', '白虎山'
      ]

      // 保存当前已侦查且未过期的NPC数据（手动刷新时跳过）
      const scoutedNpcs = new Map()
      
      if (!isManualRefresh && this.npcs.length > 0) {
        const currentTime = Date.now()
        const oneHour = 60 * 60 * 1000 // 一小时的毫秒数
        
        this.npcs.forEach(npc => {
          if (npc.scoutedAt) {
            const scoutTime = new Date(npc.scoutedAt).getTime()
            if (currentTime - scoutTime < oneHour) {
              // 侦查时间在一小时内，保存整个NPC对象
              scoutedNpcs.set(npc.id, { ...npc })
            }
          }
        })
      }

      // 生成新的NPC列表
      const newNpcs = []
      
      for (let i = 0; i < 12; i++) {
        const npcId = `npc_${i + 1}`
        
        // 检查是否有未过期的已侦查NPC数据
        const existingScoutedNpc = scoutedNpcs.get(npcId)
        if (existingScoutedNpc) {
          // 如果已侦查过且未过期，直接使用原有数据
          newNpcs.push(existingScoutedNpc)
          continue
        }
        
        // 生成新的NPC数据
        const faction = factions[Math.floor(Math.random() * factions.length)]
        const name = cityNames[Math.floor(Math.random() * cityNames.length)] + (Math.floor(Math.random() * 999) + 1)
        const level = Math.floor(Math.random() * 20) + 1
        
        // 生成防守军队
        const defenseArmy = this.generateNpcArmy(faction, level)
        
        // 生成资源（基于等级，指数增长）
        const baseResource = Math.pow(level, 2.5) * 1500 + 8000 // 指数增长基础资源
        const levelMultiplier = 1 + (level - 1) * 0.8 // 等级倍数，每级增加80%
        const finalBaseResource = baseResource * levelMultiplier
        
        const resources = {
          wood: Math.floor(finalBaseResource + Math.random() * finalBaseResource * 0.8),
          soil: Math.floor(finalBaseResource + Math.random() * finalBaseResource * 0.8),
          iron: Math.floor(finalBaseResource + Math.random() * finalBaseResource * 0.8),
          food: Math.floor(finalBaseResource + Math.random() * finalBaseResource * 0.8)
        }

        const newNpc = {
          id: npcId,
          name,
          faction,
          level,
          resources: cloneResources(resources),
          defenseArmy,
          defenderResources: cloneResources(resources), // 防守资源就是城池的原本资源
          maxResources: cloneResources(resources),
          maxDefenseArmy: cloneArmy(defenseArmy),
          recoveryState: null,
          // 坐标信息
          coordinates: {
            x: Math.floor(Math.random() * 1000),
            y: Math.floor(Math.random() * 1000)
          },
          // 侦查相关
          scoutedAt: null,
          scoutData: null,
          // 攻击相关
          lastAttacked: null,
          // 生成时间
          generatedAt: Date.now()
        }
        
        newNpcs.push(newNpc)
      }

      // 更新状态
      this.npcs = newNpcs.map(normalizeNpc)
      this.lastGeneratedTime = Date.now()
      
      this.isInitialized = true
      useGameStore().saveGame()
      
      console.log(`NPC数据已${isManualRefresh ? '手动' : '自动'}生成，共${newNpcs.length}个城池`)
    },

    //=== generateNpcArmy 根据阵营和等级生成NPC防守军队
    generateNpcArmy(faction, level) {
      const factionUnits = getFactionUnits(faction)
      if (!factionUnits.length) return { faction, units: [] }
      
      // 根据等级确定军队规模（指数增长）
      const armyScale = Math.max(1, Math.floor(level / 2.5)) // 每2.5级增加一个规模等级
      const maxUnits = Math.min(5, 1 + armyScale) // 最多5种兵种
      
      // 按兵种类型分组
      const infantryUnits = factionUnits.filter(unit => unit.unitType === UNIT_TYPES.INFANTRY)
      const cavalryUnits = factionUnits.filter(unit => unit.unitType === UNIT_TYPES.CAVALRY)
      const siegeUnits = factionUnits.filter(unit => unit.unitType === UNIT_TYPES.SIEGE)
      const specialUnits = factionUnits.filter(unit => unit.unitType === UNIT_TYPES.SPECIAL)
      
      const selectedUnits = []
      
      // 基础兵力计算（指数增长）
      const baseArmySize = Math.pow(level, 2.2) * 15 + 50 // 指数增长基础兵力
      const levelMultiplier = 1 + (level - 1) * 0.6 // 等级倍数，每级增加60%
      
      // 确保至少有一个步兵单位（基础防守）
      if (infantryUnits.length > 0) {
        const randomInfantry = infantryUnits[Math.floor(Math.random() * infantryUnits.length)]
        const count = Math.floor(baseArmySize * levelMultiplier * (0.8 + Math.random() * 0.4))
        selectedUnits.push({
          ...randomInfantry,
          count
        })
      }
      
      // 根据等级添加其他兵种
      if (level >= 4 && cavalryUnits.length > 0 && selectedUnits.length < maxUnits) {
        const randomCavalry = cavalryUnits[Math.floor(Math.random() * cavalryUnits.length)]
        const count = Math.floor(baseArmySize * levelMultiplier * 0.6 * (0.7 + Math.random() * 0.3))
        selectedUnits.push({
          ...randomCavalry,
          count
        })
      }
      
      // 中等级添加攻城武器
      if (level >= 8 && siegeUnits.length > 0 && selectedUnits.length < maxUnits) {
        const randomSiege = siegeUnits[Math.floor(Math.random() * siegeUnits.length)]
        const count = Math.floor(baseArmySize * levelMultiplier * 0.3 * (0.6 + Math.random() * 0.4))
        selectedUnits.push({
          ...randomSiege,
          count
        })
      }
      
      // 高等级添加特殊兵种
      if (level >= 12 && specialUnits.length > 0 && selectedUnits.length < maxUnits) {
        const randomSpecial = specialUnits[Math.floor(Math.random() * specialUnits.length)]
        const count = Math.floor(baseArmySize * levelMultiplier * 0.4 * (0.5 + Math.random() * 0.5))
        selectedUnits.push({
          ...randomSpecial,
          count
        })
      }
      
      // 极高等级再添加一种随机兵种
      if (level >= 18 && selectedUnits.length < maxUnits) {
        const allUnits = [...infantryUnits, ...cavalryUnits, ...siegeUnits, ...specialUnits]
        const availableUnits = allUnits.filter(unit => 
          !selectedUnits.some(selected => selected.id === unit.id)
        )
        
        if (availableUnits.length > 0) {
          const randomUnit = availableUnits[Math.floor(Math.random() * availableUnits.length)]
          const count = Math.floor(baseArmySize * levelMultiplier * 0.35 * (0.4 + Math.random() * 0.6))
          selectedUnits.push({
            ...randomUnit,
            count
          })
        }
      }
      
      return {
        faction,
        units: selectedUnits
      }
    },

    //=== scoutNpc 侦查NPC
    scoutNpc(npcId, scoutData) {
      const npc = this.getNpcById(npcId)
      if (!npc) return false
      const gameStore = useGameStore()

      // 更新侦查信息
      npc.scoutedAt = Date.now()
      npc.scoutData = {
        totalUnits: 0,
        unitTypes: 0,
        units: [],
        ...scoutData
      }

      if (npc.defenseArmy && npc.defenseArmy.units) {
        npc.scoutData.units = npc.defenseArmy.units.map(unit => ({
          id: unit.id,
          name: unit.name,
          count: unit.count
        }))
        
        npc.scoutData.totalUnits = npc.defenseArmy.units.reduce((total, unit) => total + unit.count, 0)
        npc.scoutData.unitTypes = npc.defenseArmy.units.length
      }

      if (gameStore.generalBonuses.scoutInsight >= 1) {
        npc.scoutData.resources = cloneResources(npc.resources)
      }

      gameStore.saveGame()
      return true
    },

    //=== attackNpc 攻击NPC
    attackNpc(npcId, attackResult) {
      const npc = this.getNpcById(npcId)
      if (!npc) return false
      const now = Date.now()

      this.progressSingleNpcRecovery(npc, now)

      npc.lastAttacked = now

      if (!attackResult) {
        useGameStore().saveGame()
        return true
      }

      const plunderedResources =
        attackResult.details?.plundered ||
        attackResult.plunderedResources ||
        { wood: 0, soil: 0, iron: 0, food: 0 }

      if (npc.resources) {
        Object.keys(plunderedResources).forEach((resource) => {
          npc.resources[resource] = Math.max(0, (npc.resources[resource] || 0) - (plunderedResources[resource] || 0))
        })
      }

      const defenderLosses = Array.isArray(attackResult.defender?.losses)
        ? attackResult.defender.losses
        : []

      if (npc.defenseArmy?.units?.length && defenderLosses.length > 0) {
        const lossMap = defenderLosses.reduce((result, entry) => {
          result[entry.id] = entry.count || 0
          return result
        }, {})

        npc.defenseArmy.units = npc.defenseArmy.units
          .map((unit) => ({
            ...unit,
            count: Math.max(0, (unit.count || 0) - (lossMap[unit.id] || 0))
          }))
          .filter((unit) => unit.count > 0)
      }

      syncScoutData(npc)
      this.startNpcRecovery(npc, now)

      useGameStore().saveGame()
      return true
    },

    startNpcRecovery(npc, now = Date.now()) {
      npc.recoveryState = {
        startedAt: now,
        duration: NPC_RECOVERY_DURATION,
        baseResources: cloneResources(npc.resources),
        baseDefenseArmy: cloneArmy(npc.defenseArmy)
      }
    },

    progressSingleNpcRecovery(npc, now = Date.now()) {
      if (!npc?.recoveryState) return false

      const duration = Math.max(1, npc.recoveryState.duration || NPC_RECOVERY_DURATION)
      const elapsed = Math.max(0, now - (npc.recoveryState.startedAt || now))
      const ratio = Math.min(1, elapsed / duration)
      const baseResources = npc.recoveryState.baseResources || {}
      const maxResources = npc.maxResources || {}

      Object.keys(maxResources).forEach((key) => {
        const base = Math.max(0, baseResources[key] || 0)
        const target = Math.max(base, maxResources[key] || 0)
        npc.resources[key] = Math.floor(base + (target - base) * ratio)
      })

      const baseUnitsMap = new Map((npc.recoveryState.baseDefenseArmy?.units || []).map((unit) => [unit.id, unit.count || 0]))
      const currentUnits = (npc.maxDefenseArmy?.units || []).map((unit) => {
        const baseCount = Math.max(0, baseUnitsMap.get(unit.id) || 0)
        const targetCount = Math.max(baseCount, unit.count || 0)
        return {
          ...unit,
          count: Math.floor(baseCount + (targetCount - baseCount) * ratio)
        }
      }).filter((unit) => unit.count > 0)

      npc.defenseArmy = {
        ...(npc.defenseArmy || {}),
        faction: npc.faction,
        units: currentUnits
      }

      syncScoutData(npc)

      if (ratio >= 1) {
        npc.resources = cloneResources(npc.maxResources)
        npc.defenseArmy = cloneArmy(npc.maxDefenseArmy)
        npc.recoveryState = null
        syncScoutData(npc)
      }

      return true
    },

    progressNpcRecovery(now = Date.now()) {
      this.npcs.forEach((npc) => {
        this.progressSingleNpcRecovery(npc, now)
      })
    },

    //=== manualRefresh 手动刷新NPC列表
    manualRefresh() {
      this.generateNpcs(true) // 手动刷新会清除所有侦查数据
      return true
    },

    clearStorage() {
      this.npcs = []
      this.lastGeneratedTime = 0
      this.generationInterval = 3600000
      this.manualRefreshCost = 50
      this.isInitialized = false
    },

    //=== resetNpcs 重置NPC数据
    resetNpcs() {
      this.clearStorage()
      this.generateNpcs()
    }
  }
})
