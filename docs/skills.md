# Skills 使用指南

Skills 是 Claude Code 的可调用能力模块，通过 `/skill-name` 或 Skill 工具调用。

## 项目常用 Skills

### 开发流程

| Skill | 用途 | 触发场景 |
|-------|------|----------|
| `superpowers:brainstorming` | 需求讨论、方案设计 | 任何新功能、重构、修改行为前 |
| `superpowers:writing-plans` | 编写实施计划 | 设计确认后、写代码前 |
| `superpowers:subagent-driven-development` | 子代理逐任务执行 | 计划拆分为独立任务时 |
| `superpowers:executing-plans` | 独立会话执行计划 | 需要并行执行时 |

### 代码质量

| Skill | 用途 | 触发场景 |
|-------|------|----------|
| `superpowers:test-driven-development` | TDD 开发流程 | 实现功能或修 bug 前 |
| `superpowers:systematic-debugging` | 系统化调试 | 遇到 bug、测试失败时 |
| `superpowers:requesting-code-review` | 请求代码审查 | 完成任务后、合并前 |
| `superpowers:receiving-code-review` | 处理审查反馈 | 收到 code review 意见时 |
| `code-review` | 审查 diff 找 bug | 代码变更后 |
| `simplify` | 代码简化/去冗余 | 代码变更后优化 |
| `security-review` | 安全检查 | 重要变更合并前 |
| `verify` | 验证变更效果 | 确认修复是否生效 |
| `vercel-react-best-practices` | React 性能最佳实践 | 编写/审查 React 代码时 |

### 分支与提交

| Skill | 用途 | 触发场景 |
|-------|------|----------|
| `superpowers:using-git-worktrees` | 创建隔离工作区 | 开始 feature 开发前 |
| `superpowers:finishing-a-development-branch` | 完成开发分支 | 开发完成、测试通过后 |
| `commit-commands:commit` | 创建规范 commit | 需要提交时 |
| `commit-commands:commit-push-pr` | 提交+推送+创建 PR | 准备合并时 |
| `commit-commands:clean_gone` | 清理远程已删分支 | 分支整理时 |

### 文档与配置

| Skill | 用途 | 触发场景 |
|-------|------|----------|
| `update-config` | 修改 settings.json | 权限、环境变量、hooks 配置 |
| `claude-md-management:revise-claude-md` | 更新 CLAUDE.md | 会话知识沉淀 |
| `init` | 初始化 CLAUDE.md | 新项目启动 |

### 工具类

| Skill | 用途 | 触发场景 |
|-------|------|----------|
| `run` | 启动项目并观察效果 | 需要看到实际运行效果时 |
| `frontend-design` | 高质量前端界面 | 构建 Web 组件/页面时 |
| `deep-research` | 深度调研 | 需要多源、交叉验证的报告 |
| `claude-api` | Claude API 参考 | 涉及 LLM 选型/定价/API |

## 使用原则

1. **brainstorming 优先**：任何创造性工作前必须先 brainstorm，探索需求、约束和方案
2. **写完计划再写代码**：通过 writing-plans 制定详细计划后再执行
3. **变更后审查**：每轮代码变更后用 simplify 或 code-review 检查
4. **验证再提交**：用 verify 确认功能正常后再 commit
