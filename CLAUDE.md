# Personal Blog — Project Reference

React + TypeScript (Vite) + Go (Gin) + PostgreSQL (pgx v5).

## Quick Start

```bash
bash /home/zanelin/repositories/blog/start.sh
```

Backend: `http://localhost:8080` · Frontend: `http://localhost:5173`

**Never** start services from wrong directories — the Go binary MUST run from `backend/` so `./uploads` resolves correctly. The start script handles this.

# Project Instructions

see @docs/Implementation.md for API description, db interface and funtion implementations
see @docs/test.md for testing requirements
see @docs/diff.md for diff
see @docs/deployment.md for deployment, VPS, CI/CD and ops workflows
see @docs/skills.md for available skills and their usage
see @docs/mcp.md for MCP server tools (CodeGraph, Chrome DevTools, Context7)
see @docs/plugins.md for plugin management

# 任何项目都务必遵守的规则（极其重要！！！）

## Communication

- 永远使用简体中文进行思考和对话

## Documentation

- 编写 .md 文档时，也要用中文
- 正式文档写到项目的 docs/ 目录下
- coding规则写在 rules/ 目录下
- 用于讨论和评审的计划、方案等文档，写到项目的 discuss/ 目录下

## 模型调度规则

- 主模型：opus（文本任务、规划任务）
- 子模型：sonnet（具体执行、代码任务）
- 多模态：haiku(图片、pdf等)
- 涉及图片/PDF的任务：使用 Agent 工具，指定 model: "kimi-k2.7-code" 来处理
- 不涉及图片的任务：直接使用当前模型执行

## Code Architecture

- 编写代码的硬性指标，包括以下原则：
  （1）对于 Python、JavaScript、TypeScript 等动态语言，尽可能确保每个代码文件不要超过 300 行
  （2）对于 Java、Go、Rust 等静态语言，尽可能确保每个代码文件不要超过 400 行
  （3）每层文件夹中的文件，尽可能不超过 8 个。如有超过，需要规划为多层子文件夹
- 除了硬性指标以外，还需要时刻关注优雅的架构设计，避免出现以下可能侵蚀我们代码质量的「坏味道」：
  （1）僵化 (Rigidity): 系统难以变更，任何微小的改动都会引发一连串的连锁修改。
  （2）冗余 (Redundancy): 同样的代码逻辑在多处重复出现，导致维护困难且容易产生不一致。
  （3）循环依赖 (Circular Dependency): 两个或多个模块互相纠缠，形成无法解耦的“死结”，导致难以测试与复用。
  （4）脆弱性 (Fragility): 对代码一处的修改，导致了系统中其他看似无关部分功能的意外损坏。
  （5）晦涩性 (Obscurity): 代码意图不明，结构混乱，导致阅读者难以理解其功能和设计。
  （6）数据泥团 (Data Clump): 多个数据项总是一起出现在不同方法的参数中，暗示着它们应该被组合成一个独立的对象。
  （7）不必要的复杂性 (Needless Complexity): 用“杀牛刀”去解决“杀鸡”的问题，过度设计使系统变得臃肿且难以理解。
- 【非常重要！！】无论是你自己编写代码，还是阅读或审核他人代码时，都要严格遵守上述硬性指标，以及时刻关注优雅的架构设计。
- 【非常重要！！】无论何时，一旦你识别出那些可能侵蚀我们代码质量的「坏味道」，都应当立即询问用户是否需要优化，并给出合理的优化建议。

## Run & Debug

- 必须首先在项目的 scripts/ 目录下，维护好 Run & Debug 需要用到的全部 .sh 脚本
- 对于所有 Run & Debug 操作，一律使用 scripts/ 目录下的 .sh 脚本进行启停。永远不要直接使用 npm、pnpm、uv、python 等等命令
- 如果 .sh 脚本执行失败，无论是 .sh 本身的问题还是其他代码问题，需要先紧急修复。然后仍然坚持用 .sh 脚本进行启停
- Run & Debug 之前，为所有项目配置 Logger with File Output，并统一输出到 logs/ 目录下

## Python

- 数据结构尽可能全部定义成强类型。如果个别场景不得不使用未经结构化定义的 dict，需要先停下来征求用户的同意
- Python 虚拟环境永远使用 .venv 作为目录名
- 必须使用 uv，而不是 pip、poetry、conda、python3、python。包括依赖管理、构建、调试启动等所有环节
- 项目的根目录必须保持简洁，只保留必须存在的文件
- main.py 内容也要简洁。只保留必须存在的代码

## React / Next.js / TypeScript / JavaScript

- Next.js 不要再用 v15.3 或 v14 或以下版本
- React 不要再用 v18 或以下版本
- Tailwind CSS 不要再用 v3 或以下版本
- 严禁使用 commonjs 模块系统
- 尽可能使用 TypeScript。只有在构建工具完全不支持 TypeScript 的时候，才使用 JavaScript
- 数据结构尽可能全部定义成强类型。如果个别场景不得不使用 any 或未经结构化定义的 json，需要先停下来征求用户的同意

## Go / Gin / pgx

- Go 版本 ≥ 1.22，使用 go mod 管理依赖
- 后端分层：handler → service → repository，单向依赖，禁止反向引用
- 接口定义与实现在同一文件（Go 惯例），每个领域子包用独立接口名避免冲突
- 所有 SQL 查询使用参数化（`$1, $2`），严禁字符串拼接防 SQL 注入
- 错误处理：repository 返回原始 error，service 包装为业务错误，handler 映射 HTTP 状态码
- 在 `backend/` 目录下运行所有 go 命令

## CodeGraph 代码智能

本项目已索引 CodeGraph（`.codegraph/` 目录存在）。**理解或定位代码时优先使用 CodeGraph：**

- `codegraph_explore` — 一次调用返回相关符号源码 + 调用路径，替代多次 grep/read
- `codegraph_node` — 读取单个符号或文件的源码 + 调用者
- `codegraph_search` — 按名称搜索符号

**原则：** `codegraph_explore` > `codegraph_node` > `grep/Read`。不要开着 CodeGraph 不用然后自己做 grep。

## Git 提交规范

- 提交信息使用英文，格式：`type(scope): description`
- 类型：`feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`
- 范围：`backend`, `frontend`, 或具体模块
- 每次提交以 `Co-Authored-By: Claude <noreply@anthropic.com>` 结尾
- 提交前确保：`go build ./...` / `go vet ./...` / `npx tsc --noEmit` / `npx vite build` 全部通过

## 远程提交

注意替换含敏感信息的文件（如API-key,用户信息等）
