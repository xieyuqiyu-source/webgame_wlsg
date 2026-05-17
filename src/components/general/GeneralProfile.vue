<template>
  <div v-if="general && progress" class="general-profile">
    <div class="profile-header">
      <div>
        <div class="profile-name">{{ general.name }}</div>
        <div class="profile-title">{{ general.title }}</div>
      </div>
      <div class="profile-level">Lv.{{ progress.level }}</div>
    </div>
    <div class="profile-exp">
      <div class="exp-row"><span>经验</span><span>{{ progress.exp }} / {{ expForNextLevel }}</span></div>
      <div class="exp-track"><div class="exp-fill" :style="{ width: `${expPercent}%` }" /></div>
    </div>
    <div class="profile-trait"><strong>{{ general.trait.name }}</strong><span>{{ general.trait.description }}</span></div>
    <div v-if="activeBonusRows.length" class="profile-bonuses">
      <div class="bonus-title">当前生效</div>
      <div v-for="bonus in activeBonusRows" :key="bonus.label" class="bonus-row">
        <span>{{ bonus.label }}</span>
        <strong>{{ bonus.value }}</strong>
      </div>
    </div>
    <div class="profile-points">可分配属性点：{{ progress.unspentPoints }}</div>
    <div class="attribute-list">
      <div v-for="(attribute, key) in attributes" :key="key" class="attribute-row">
        <div>
          <div class="attribute-name">{{ attribute.name }}</div>
          <div class="attribute-desc">{{ attribute.description }}</div>
        </div>
        <div class="attribute-actions">
          <span>{{ progress.attributes[key] }}</span>
          <button type="button" :disabled="progress.unspentPoints <= 0" @click="$emit('allocate', key)">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { GENERAL_ATTRIBUTES } from '@/config/generalConfig.js'

export default {
  name: 'GeneralProfile',
  props: {
    general: { type: Object, default: null },
    progress: { type: Object, default: null },
    expForNextLevel: { type: Number, default: 0 },
    bonuses: { type: Object, default: null }
  },
  emits: ['allocate'],
  setup(props) {
    const expPercent = computed(() => {
      if (!props.expForNextLevel || !props.progress) return 0
      return Math.min(100, Math.round((props.progress.exp / props.expForNextLevel) * 100))
    })
    const activeBonusRows = computed(() => {
      if (!props.bonuses) return []

      const rows = []
      const percent = (multiplier, baseline = 1) => Math.round(Math.abs(multiplier - baseline) * 100)

      if (props.bonuses.economyMultiplier > 1) rows.push({ label: '资源产量', value: `+${percent(props.bonuses.economyMultiplier)}%` })
      if (props.bonuses.buildingTimeMultiplier < 1) rows.push({ label: '建设速度', value: `+${percent(props.bonuses.buildingTimeMultiplier)}%` })
      if (props.bonuses.recruitmentTimeMultiplier < 1) rows.push({ label: '征兵速度', value: `+${percent(props.bonuses.recruitmentTimeMultiplier)}%` })
      if (props.bonuses.attackMultiplier > 1) rows.push({ label: '部队攻击', value: `+${percent(props.bonuses.attackMultiplier)}%` })
      if (props.bonuses.defenseMultiplier > 1) rows.push({ label: '部队防御', value: `+${percent(props.bonuses.defenseMultiplier)}%` })
      if (props.bonuses.carryMultiplier > 1) rows.push({ label: '运载能力', value: `+${percent(props.bonuses.carryMultiplier)}%` })
      if (props.bonuses.marchSpeedMultiplier > 1) rows.push({ label: '行军速度', value: `+${percent(props.bonuses.marchSpeedMultiplier)}%` })
      if (props.bonuses.scoutInsight > 0) rows.push({ label: '侦查洞察', value: `+${Math.round(props.bonuses.scoutInsight)}` })

      return rows
    })
    return { attributes: GENERAL_ATTRIBUTES, expPercent, activeBonusRows }
  }
}
</script>

<style scoped>
.general-profile { display: flex; flex-direction: column; gap: 14px; }
.profile-header, .exp-row, .attribute-row, .attribute-actions { display: flex; align-items: center; justify-content: space-between; }
.profile-name { color: #1f2937; font-size: 18px; font-weight: 700; }
.profile-title { color: #4f46e5; font-size: 13px; }
.profile-level { border-radius: 999px; padding: 4px 10px; color: #fff; background: #4f46e5; font-size: 12px; font-weight: 700; }
.profile-exp, .profile-trait { color: #374151; font-size: 13px; }
.exp-track { height: 8px; margin-top: 6px; overflow: hidden; border-radius: 999px; background: #e5e7eb; }
.exp-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #4f46e5, #818cf8); }
.profile-trait { display: flex; flex-direction: column; gap: 3px; }
.profile-bonuses { display: flex; flex-direction: column; gap: 8px; padding: 12px; border-radius: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; }
.bonus-title { color: #166534; font-size: 13px; font-weight: 700; }
.bonus-row { display: flex; align-items: center; justify-content: space-between; color: #166534; font-size: 13px; }
.bonus-row strong { color: #15803d; }
.profile-points { color: #059669; font-size: 13px; font-weight: 700; }
.attribute-list { display: flex; flex-direction: column; gap: 10px; }
.attribute-row { gap: 12px; }
.attribute-name { color: #111827; font-size: 14px; font-weight: 600; }
.attribute-desc { color: #6b7280; font-size: 12px; }
.attribute-actions { gap: 8px; color: #111827; font-weight: 700; }
.attribute-actions button { width: 26px; height: 26px; border: 0; border-radius: 999px; color: #fff; background: #4f46e5; }
.attribute-actions button:disabled { cursor: not-allowed; background: #9ca3af; }
</style>
