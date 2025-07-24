## 项目开发规则
1. 目录结构遵循良好的规范，易读，见名知意
2. 全局可复用组件写入src/components
3. 页面组件写入 src/view
4. 页面代码尽量不超过 300 行
5. 开发时可拆分模块放入该目录下的 component
6. 文件命名规范遵循驼峰命名法
7. 样式规范 Tailwindcss优先，复杂逻辑可落地到 .Scss
8. 代码注释详细
9. 每个方法顶部加//===注释，注释内容为方法名+简单功能名。
10. API （AXIOS）接口规范封装，每个接口对应一个文件，文件名即为接口名，文件内容即为接口定义。
11. 进行回答时，回答问题类前面加个：Ask😄：
12. 进行回答时，执行修改代码类前面加个：Code🙂：

## 补充
1. 本项目是文字放置类游戏。
2. 本项目名字叫武林三国。
3. 本项目基于 Vue3 + JavaScript + Pinia + VueRouter + Vite + Tailwindcss + NaiveUI
4. 色系 绿色：#237C48  黄色：#FFB900 红色：#FF6367 黑色：#18181B。

## 🗂️ 目录结构规范

```bash
src/
├── assets/        # 静态资源（如图标、图片、字体）
├── components/    # 通用组件
├── layouts/       # 页面布局模板
├── modules/       # 业务模块（资源、建筑、城市等）
├── services/      # API 请求模块（封装 axios）
├── store/         # 状态管理（Pinia）
├── utils/         # 工具函数（如节流、防抖、格式化等）
├── hooks/         # 组合式函数（如 useTimer、useUpgrade）
├── constants/     # 常量枚举定义
├── locales/       # 国际化配置（可选）
├── config/        # 项目配置项（如环境变量、基础路径）
├── views/         # 路由页面（一个页面 = 一个功能页）
└── App.vue / main.js

