# 武林三国 (WLSG) Copilot 开发指南

## 项目概览
这是一个基于 Vue3 + Pinia + TailwindCSS 的文字放置类游戏项目，主题为三国题材的策略游戏。

## 技术栈架构
- **前端框架**: Vue 3 (Composition API + `<script setup>`)
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **样式**: TailwindCSS + SCSS + NaiveUI 组件库
- **构建工具**: Vite

## 核心架构模式

### 游戏状态管理
- **中央状态**: `src/store/modules/gameStore.js` 管理所有游戏数据，包括资源、建筑、升级进度
- **实时更新**: 使用 `src/hooks/useGameTimer.js` 处理资源自动更新和数据保存
- **配置分离**: 游戏规则配置在 `src/config/` 目录中独立管理

### 组件结构模式
```
src/
├── components/     # 全局可复用组件 (如 UserInitDialog, ResourceBar)
├── views/         # 页面级组件 (城市、军事、地图、设置)
│   └── */components/  # 页面专用组件
├── config/        # 游戏配置 (建筑、阵营、单位配置)
├── hooks/         # 复用逻辑 (游戏定时器、升级逻辑)
└── utils/         # 工具函数 (格式化、UUID 生成)
```

### 代码规范约定
1. **方法注释**: 每个方法必须以 `//=== 方法名 + 功能` 开头
2. **驼峰命名**: 文件和变量使用驼峰命名法
3. **组件限制**: 页面组件不超过 300 行，复杂逻辑拆分到子组件
4. **样式优先级**: TailwindCSS > SCSS

## 关键开发模式

### 游戏时间系统
```javascript
// 资源自动更新机制 - src/hooks/useGameTimer.js
const UPDATE_INTERVAL = 1000 // 1秒更新
const SAVE_INTERVAL = 1000 * 60 * 5 // 5分钟自动保存
```

### 建筑升级系统
- 每种资源类型有5个独立建筑槽位
- 升级进度存储在 `buildingUpgrades` 状态中
- 配置在 `src/config/gameConfig.js` 的 `BUILDING_CONFIG`

### 响应式数据流
```javascript
// 典型的 Getter 模式 - 计算总产出
hourlyProduction: (state) => {
  // 遍历所有建筑类型和等级计算总产出
}
```

### 组件通信模式
- **状态注入**: 使用 `const gameStore = useGameStore()` 访问全局状态
- **事件处理**: 升级、购买等操作直接调用 store 方法
- **实时同步**: 组件通过 computed 属性自动响应状态变化

## 开发工作流

### 启动开发环境
```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm preview      # 预览构建结果
```

### 新功能开发流程
1. 在 `src/config/` 中定义游戏规则配置
2. 在 `src/store/modules/gameStore.js` 中添加状态和操作方法
3. 创建页面组件或子组件实现 UI
4. 使用 TailwindCSS 进行样式设计

### 游戏平衡调整
- 修改 `src/config/gameConfig.js` 中的 `productionByLevel` 数组调整产量
- 调整 `upgradeCost.base` 和 `growth` 修改升级成本
- 文明度计算在 `src/config/civilizationConfig.js`

## 特殊注意事项

### 性能优化
- 文明度计算有缓存机制 (`_civilizationCache`)
- 资源更新使用累积系统处理小数精度
- 页面可见性 API 处理离线收益计算

### 数据持久化
- 游戏数据自动保存到 localStorage
- 页面隐藏/卸载时强制保存数据
- 首次进入显示用户初始化对话框

### 阵营系统
- 三大阵营：魏、蜀、吴，各有不同加成效果
- 配置在 `src/config/factionConfig.js`
- 影响经济、军事、政治发展

编写代码时，始终考虑游戏的实时性、平衡性和用户体验，保持配置与逻辑分离的架构原则。
