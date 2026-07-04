# Plugins 使用指南

Plugins 扩展 Claude Code 能力，含 skills / agents / hooks / MCP 服务器等。

## 已安装 Plugins

### claude-plugins-official

| Plugin | 用途 | 状态 |
|--------|------|------|
| `commit-commands` | 规范提交：`commit` / `commit-push-pr` / `clean_gone` | 启用 |
| `claude-md-management` | 管理 CLAUDE.md：`revise-claude-md` / `init` | 启用 |
| `github` | GitHub MCP（PR / issue / 搜索 / code search） | 启用 |
| `context7` | 第三方库实时文档查询（React/Tailwind/Prisma 等） | 启用 |
| `security-guidance` | 安全审查指导 | 启用 |
| `gopls-lsp` | Go 语言 LSP（跳转/悬停/引用） | 启用 |
| `typescript-lsp` | TypeScript LSP（跳转/悬停/引用） | 启用 |
| `superpowers` | 开发工作流 skills（brainstorming/writing-plans/TDD 等） | **禁用**（项目 settings.json） |

### ponytail

| Plugin | 用途 |
|--------|------|
| `ponytail` | 懒惰开发者 skill（最小代码/依赖，ladder 优先级） |

## 配置

- 全局：`~/.claude/settings.json`
- 项目：`.claude/settings.json`（`enabledPlugins` 字段）
- 当前项目禁用 `superpowers@claude-plugins-official`（`false`）
- 安装清单：`~/.claude/plugins/installed_plugins.json`

## 常用命令

| 命令 | 说明 |
|------|------|
| `/plugin list` | 列出已安装插件 |
| `/plugin install <name>` | 安装插件 |
| `/plugin uninstall <name>` | 卸载插件 |
| `/plugin marketplace add <url>` | 添加插件市场 |
| `/reload-plugins` | 重载所有插件 |

## 使用原则

1. **提交**用 `commit-commands`（规范 commit message）。
2. **库文档**用 `context7`（查 React/Tailwind 等最新 API）。
3. **LSP** 自动工作（gopls-lsp/typescript-lsp），无需手动调用。
4. `superpowers` 已禁用，其 skills 不可用。
