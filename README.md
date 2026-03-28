# webgame_wlsg

一个基于 `Vue 3 + Pinia + Vite` 的三国题材文字放置类 Web 游戏项目。

这个项目主要是做一个偏单机、偏养成的浏览器游戏原型，核心内容是资源增长、建筑升级、阵营发展和页面交互。

## 现在大概有什么

- 城池发展
- 资源系统
- 建筑系统
- 阵营选择
- 部分军事和地图页面
- 基于前端状态管理的单机玩法原型

## 平时怎么启动

安装依赖：

```bash
npm install
```

开发模式：

```bash
npm run dev
```

构建：

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

## 我以后主要看哪里

- `src/views/`：主要页面
- `src/components/`：公共组件
- `src/store/`：游戏状态
- `src/config/`：资源、阵营、单位配置
- `src/hooks/`：计时器等逻辑

## 备注

- 这是前端游戏原型项目
- 当前仓库里有未整理完的本地改动
- 如果以后忘了怎么跑，优先执行 `npm run dev`
