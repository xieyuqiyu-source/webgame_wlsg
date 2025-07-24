# 武林三国 🏰⚔️

一款基于 Vue3 的文字放置类三国题材策略游戏，体验经典三国文化与现代Web技术的完美结合。

## 📖 项目简介

武林三国是一款以三国为背景的文字放置类游戏，玩家可以选择魏、蜀、吴三个阵营，通过建设城池、发展经济、训练军队来扩展自己的势力。游戏采用现代化的Web技术栈，提供流畅的游戏体验和精美的界面设计。

## ✨ 游戏特色

- 🏛️ **城池建设**：建造和升级各种建筑，发展城池经济
- 📊 **资源管理**：管理木材、土壤、铁矿、粮食四种核心资源
- ⚔️ **军队系统**：训练多种兵种，组建强大军队
- 🗺️ **地图探索**：在广阔的三国世界中征战四方
- 👑 **阵营选择**：选择魏、蜀、吴三国，体验不同的游戏策略
- 📈 **文明发展**：提升城池文明度，解锁更多功能

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **状态管理**：Pinia
- **路由管理**：Vue Router 4
- **构建工具**：Vite
- **样式框架**：Tailwind CSS
- **UI组件库**：Naive UI
- **开发语言**：JavaScript

## 📦 安装指南

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 pnpm >= 7.0.0

### 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd wlsg_web
```

2. **安装依赖**
```bash
# 使用 npm
npm install

# 或使用 pnpm (推荐)
pnpm install
```

3. **启动开发服务器**
```bash
# 使用 npm
npm run dev

# 或使用 pnpm
pnpm dev
```

4. **访问游戏**
打开浏览器访问 `http://localhost:5173`

## 🎮 游戏指南

### 初始设置

1. **选择阵营**：游戏开始时选择魏、蜀、吴三国之一
2. **城池命名**：为你的城池起一个响亮的名字
3. **了解界面**：熟悉游戏的各个功能模块

### 核心玩法

#### 🏗️ 建筑系统
- **伐木场**：生产木材资源
- **农田**：生产粮食资源
- **采石场**：生产土壤资源
- **铁矿场**：生产铁矿资源
- **仓库**：存储各种资源

#### 📊 资源管理
- **木材**：建筑升级的基础材料
- **土壤**：城池建设必需品
- **铁矿**：军事装备制造原料
- **粮食**：军队维持和人口增长

#### ⚔️ 军事系统
- 训练不同类型的军队单位
- 组建强大的军团征战四方
- 参与各种军事活动和战役

### 界面说明

- **左侧边栏**：显示城池信息、资源状态、生产力数据
- **主界面**：建筑管理和城池发展
- **底部导航**：快速切换城池、军事、地图、设置页面

## 📁 项目结构

```
src/
├── assets/        # 静态资源（图标、图片、字体）
├── components/    # 通用组件
│   ├── GameSidebar.vue     # 游戏侧边栏
│   ├── ResourceBar.vue     # 资源显示栏
│   └── UserInitDialog.vue  # 用户初始化对话框
├── config/        # 游戏配置
│   ├── gameConfig.js       # 游戏基础配置
│   ├── factionConfig.js    # 阵营配置
│   ├── resources.js        # 资源配置
│   └── unitsConfig.js      # 单位配置
├── store/         # 状态管理
│   └── modules/
│       └── gameStore.js    # 游戏状态管理
├── utils/         # 工具函数
│   ├── formatters.js       # 格式化工具
│   └── uuid.js            # UUID生成器
├── views/         # 页面组件
│   ├── GameDemo.vue        # 游戏主页面
│   ├── city/              # 城池相关页面
│   ├── military/          # 军事相关页面
│   ├── map/               # 地图相关页面
│   └── settings/          # 设置相关页面
└── hooks/         # 组合式函数
    └── useGameTimer.js     # 游戏计时器
```

## 🚀 构建部署

### 生产构建
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 部署选项

- **Vercel**：支持自动部署
- **Netlify**：静态站点托管
- **GitHub Pages**：免费静态托管
- **自建服务器**：Nginx + 静态文件

## 🔧 开发指南

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 Vue 3 Composition API 最佳实践
- 组件命名采用 PascalCase
- 文件命名采用 camelCase
- 样式优先使用 Tailwind CSS

### 提交规范

```bash
# 功能开发
git commit -m "feat: 添加新的建筑系统"

# 问题修复
git commit -m "fix: 修复资源计算错误"

# 样式调整
git commit -m "style: 优化侧边栏布局"
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🎯 路线图

- [ ] 多人在线功能
- [ ] 联盟系统
- [ ] 更多建筑类型
- [ ] 战斗动画效果
- [ ] 移动端适配
- [ ] 音效和背景音乐

## 📞 联系我们

如果你有任何问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发送邮件
- 加入社区群组

---

**开始你的三国征程吧！** 🚀
