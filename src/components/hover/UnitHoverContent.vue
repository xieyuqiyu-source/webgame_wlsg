<template>
  <div class="unit-hover-content">
    <div class="unit-hover-title">
      <span>{{ unit.icon }}</span>
      <strong>{{ unit.name }}</strong>
    </div>
    <div class="unit-hover-grid">
      <div class="unit-hover-stat">
        <span>攻击</span>
        <strong>{{ unit.attack }}</strong>
      </div>
      <div class="unit-hover-stat">
        <span>步防</span>
        <strong>{{ unit.infantryDefense }}</strong>
      </div>
      <div class="unit-hover-stat">
        <span>骑防</span>
        <strong>{{ unit.cavalryDefense }}</strong>
      </div>
      <div class="unit-hover-stat">
        <span>速度</span>
        <strong>{{ unit.speed }}</strong>
      </div>
      <div class="unit-hover-stat wide">
        <span>运载量</span>
        <strong>{{ unit.carryCapacity }}</strong>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UnitHoverContent',
  props: {
    unit: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.unit-hover-content {
  padding: 12px;
}

.unit-hover-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #ffffff;
}

.unit-hover-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.unit-hover-stat {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 8px;
  font-size: 12px;
  color: #d1d5db;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
}

.unit-hover-stat strong {
  color: #ffb900;
}

.unit-hover-stat.wide {
  grid-column: 1 / -1;
}
</style>
