# Skills 使用指南

Skills 是 Claude Code 的可调用能力模块，通过 `/skill-name` 或 Skill 工具调用。

## 全局 Skills（`~/.claude/skills/`）

| Skill | 用途 | 触发场景 |
|-------|------|----------|
| `design-taste-frontend` | 反 AI-slop 前端设计规范（配色/字体/布局/动效/禁忌） | 前端设计、重设计 |
| `frontend-design` | 高质量前端界面构建 | 构建 Web 组件/页面 |
| `web-design-guidelines` | 网页设计指南 | 网页设计决策 |
| `redesign-existing-projects` | 重设计现有项目流程 | 项目重设计 |
| `vercel-react-best-practices` | React 性能最佳实践 | 编写/审查 React 代码 |
| `planning-with-files` | 用文件做规划 | 复杂任务规划 |
| `find-skills` | 查找可用 skills | 发现新能力 |

## 项目 Skills（`.claude/skills/`）

| Skill | 用途 | 触发场景 |
|-------|------|----------|
| `ui-ux-pro-max` | UI/UX 设计智能数据库（styles/palettes/fonts/UX rules，含 search.py） | UI/UX 设计决策、生成设计系统推荐 |

## Plugin Skills

| Skill | 来源 plugin | 用途 |
|-------|------------|------|
| `ponytail` | ponytail | 懒惰高级开发者：最小代码/最小依赖，避免过度工程（ladder：复用已有 → stdlib → 已装依赖 → 最小代码） |

## 使用原则

1. **前端设计**优先 `design-taste-frontend`（反 AI-slop）+ `ui-ux-pro-max`（设计智能）。
2. **代码精简**用 `ponytail`（但用户明确要求时服从用户，不强制）。
3. **React 审查**用 `vercel-react-best-practices`。
4. Skill 通过 `/name` 调用，或 Skill 工具。
5. 只调用列表中存在的 skill，不臆造。
