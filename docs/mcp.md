# MCP (Model Context Protocol) 使用指南

本项目通过 MCP 服务器扩展 Claude Code 能力。

## 已配置的 MCP 服务器

### CodeGraph — 代码智能分析

CodeGraph 将整个代码库索引为 SQLite 知识图谱，提供亚毫秒级符号查询和调用链追踪。

**何时使用：** 回答 "X 如何工作"、架构理解、定位代码、理解调用关系时，**优先使用 CodeGraph，而不是 grep/read**。

**主要工具：**

| 工具 | 用途 | 示例 |
|------|------|------|
| `codegraph_explore` | **首选工具** — 一次调用返回相关符号的完整源码和调用路径 | "AuthService register 怎么被调用的" |
| `codegraph_node` | 读取单个文件或符号的源码+调用者 | 查看某个函数实现和谁调用了它 |
| `codegraph_search` | 按名称搜索符号 | 搜索 "AuthHandler" |
| `codegraph_callers` | 列出某符号的所有调用者 | 查看谁调用了 `generateSlug` |

**使用原则：**
- 任何代码理解问题应先尝试 `codegraph_explore`
- 一次 `codegraph_explore` 调用通常能替代多次文件读取
- 项目根目录必须有 `.codegraph/` 索引目录

### Chrome DevTools — 浏览器自动化

通过 Chrome DevTools Protocol 控制浏览器，用于 UI 测试和验证。

**主要工具：** `navigate_page`, `take_screenshot`, `take_snapshot`, `click`, `fill`, `evaluate_script` 等

**何时使用：** 需要验证前端 UI 实际渲染效果、截图对比、交互测试时。

### Context7 — 实时文档查询

获取最新版本的第三方库文档，避免训练数据过时问题。

**主要工具：**
| 工具 | 用途 |
|------|------|
| `resolve-library-id` | 将包名解析为 Context7 库 ID |
| `query-docs` | 查询库的最新文档和代码示例 |

**何时使用：** 涉及 React、Next.js、Tailwind、Prisma 等第三方库的 API 用法、配置、版本迁移时。

## 使用原则

1. **CodeGraph 优先**：理解代码时先尝试 CodeGraph，再考虑 grep/read
2. **Context7 辅助**：涉及第三方库 API 时用它查最新文档
3. **Chrome DevTools 按需**：UI 验证时使用浏览器截图/快照
