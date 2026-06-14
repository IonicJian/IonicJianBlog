# Plugins 使用指南

Plugins 扩展 Claude Code 的能力，包括 skills、agents、hooks、MCP 服务器等。

## 已安装的 Plugins

### superpowers (claude-plugins-official)

核心开发工作流插件，提供完整的软件工程方法论。

**包含的 Skills：** brainstorming, writing-plans, executing-plans, subagent-driven-development, test-driven-development, systematic-debugging, requesting-code-review, receiving-code-review, using-git-worktrees, verification-before-completion, finishing-a-development-branch 等

**配置：** 项目级启用（`.claude/settings.json`）

### gopls-lsp

Go 语言的 Language Server Protocol 支持。

**功能：** 代码跳转、符号查找、悬停提示、引用查找等 IDE 功能。

**使用：** 通过 LSP 工具自动工作，无需手动调用。

## 常用命令

| 命令 | 说明 |
|------|------|
| `/plugin list` | 列出已安装的插件 |
| `/plugin install <name>` | 安装插件 |
| `/plugin uninstall <name>` | 卸载插件 |
| `/plugin marketplace add <url>` | 添加插件市场 |
| `/reload-plugins` | 重载所有插件 |
| `/reload-skills` | 重载 skills |

## 配置

插件配置存储在：
- 项目级：`.claude/settings.json` 的 `enabledPlugins` 字段
- 用户级：`~/.claude/settings.json`

## 使用原则

1. **核心工作流必须使用 superpowers**：brainstorming → writing-plans → executing 是标准开发流程
2. **按需安装**：只安装项目必需的插件，避免不必要的开销
3. **项目级优先**：优先在项目级配置，团队共享
