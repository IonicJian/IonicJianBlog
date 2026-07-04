# Design System — IonicJ 博客

> 参照 Tailwind 官网主页精髓：全屏网格骨架 + 纵横细浅线条划分区域 + 半透明填充 + 大留白。
> 双模式（深色为主 + 浅色切换）。本文是设计风格统一规范；具体组件实现见 `frontend-rebuild-spec.md`。

---

## 1. 视觉主题与氛围

- **情绪**：克制、技术、有冲击力。全屏占满，网格骨架撑起整体结构，不零散。
- **核心精髓**：纵横细浅线条划分网格，把区域和卡片框出来，区域间留白。线条是骨架，不是装饰。
- **密度**：中等。比 Tailwind 主页收窄（博客场景，垂直节奏 py-8 ~ py-12，非 Tailwind 的 py-24），但保留全屏网格的冲击力。
- **设计理念**：
  - 全屏骨架：页面占满视口（min-h-dvh），用网格 + 线条组织，不漂浮零散卡片。
  - 线条划分：1px 浅线条（`border-border`）纵横分割区域，区域/卡片由线条框出。
  - 半透明填充：框出的区域用半透明灰（`white/5`）填充，形成镂空层次，不实心。
  - 留白：区域间留呼吸空间（gutter + gap），但博客收窄，不浪费。

---

## 2. 色彩系统与功能

双模式，深色默认。off-black/off-white，不用纯黑纯白。颜色用 CSS 变量 + Tailwind utility。

| 语义名               | 深色               | 浅色                | 功能角色                     |
| -------------------- | ------------------ | ------------------- | ---------------------------- |
| `background`         | `#030712`          | `#fafafa`           | 页面底色                     |
| `foreground`         | `#fafafa`          | `#030712`           | 正文文字                     |
| `card`               | `rgb(255 255 5%)`  | `rgb(3 7 18 / 5%)`  | 区域/卡片镂空填充（半透明）  |
| `card-foreground`    | `#fafafa`          | `#030712`           | 卡片文字                     |
| `popover`            | `rgb(255 255 10%)` | `#ffffff`           | 弹层表面                     |
| `popover-foreground` | `#fafafa`          | `#030712`           | 弹层文字                     |
| `primary`            | `#625fff`          | `#625fff`           | 强调（CTA / 链接 / 焦点环）  |
| `primary-foreground` | `#ffffff`          | `#ffffff`           | 强调上文字                   |
| `secondary`          | `rgb(255 255 10%)` | `rgb(3 7 18 / 8%)`  | 次级表面                     |
| `muted`              | `rgb(255 255 5%)`  | `#f4f4f5`           | 静默表面（代码块底等）       |
| `muted-foreground`   | `#b8bfc6`          | `#6b7280`           | 次要文字                     |
| `accent`             | `rgb(255 255 12%)` | `#f4f4f5`           | hover 表面                   |
| `border`             | `rgb(255 255 10%)` | `rgb(3 7 18 / 10%)` | **网格线条 / 边框 / 分割线** |
| `ring`               | `#625fff`          | `#625fff`           | 焦点环                       |
| `destructive`        | `#ef4444`          | `#ef4444`           | 危险 / 删除                  |
| `code-bg`            | `#0c0a09`          | `#f4f4f5`           | 代码块背景                   |

**规则**：

- `primary`（`#625fff`）仅用于 CTA、关键链接、焦点环、active 状态。不用作大块背景、不用渐变、不用 glow。
- `border` 是网格骨架的线条色，全站统一 `white/10`（深色）/ `gray-950/10`（浅色），1px。
- 区域填充用半透明 `card`（`white/5`），不用实心。
- 中性色全站统一灰阶（gray-950 / white 透明度），不混 slate/zinc/neutral。
- 禁忌：不要把蓝色或紫色用作任何按键的底色！也尽量不要作为字体颜色，包括hover效果里面的。元数据一定不能写入代码！

---

## 3. 排版规则

**字体家族**

- `--font-sans`: `"Inter", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif`
- `--font-mono`: `"IBM Plex Mono", ui-monospace, "JetBrains Mono", Menlo, monospace`
- 英文 Inter（`@fontsource-variable/inter` 自托管），中文走系统（不加载 webfont，保 LCP），代码 IBM Plex Mono（`@fontsource/ibm-plex-mono`）。
- 标题 Inter `font-semibold`，不用衬线、不用 black。

**层级规范表**

| 元素            | size              | weight   | line-height | letter-spacing | 用途                        |
| --------------- | ----------------- | -------- | ----------- | -------------- | --------------------------- |
| h1（Hero 名字） | text-6xl（60px）  | semibold | 1.05        | -0.02em        | HomePage Hero（全屏冲击力） |
| h1（页标题）    | text-5xl（48px）  | semibold | 1.05        | -0.02em        | 页面主标题                  |
| h2              | text-3xl（30px）  | semibold | 1.15        | -0.01em        | 区块标题                    |
| h3              | text-xl（20px）   | semibold | 1.3         | -0.01em        | 卡片标题 / 子标题           |
| h4              | text-base（16px） | semibold | 1.4         | 0              | 小标题                      |
| body            | text-base（15px） | normal   | 1.7         | 0              | 正文                        |
| body-sm         | text-sm（14px）   | normal   | 1.6         | 0              | 次要正文 / 卡片摘要         |
| caption         | text-xs（12px）   | normal   | 1.5         | 0.02em         | 日期 / meta / 标签          |
| code            | text-sm（14px）   | normal   | 1.6         | 0              | 行内代码 / 代码块（mono）   |
| button          | text-sm（14px）   | medium   | 1           | 0              | 按钮文字                    |

**规则**：

- 正文行宽 `max-w-3xl`（约 65ch）。
- 行高：标题 1.05~1.3，正文 1.7。
- 中文不加大 letter-spacing，英文标题微紧（-0.01em ~ -0.02em）。
- 数字用 `tabular-nums`。

---

## 4. 组件样式

通用样式规范。具体组件实现见 `frontend-rebuild-spec.md`。

### 网格区域 / 卡片（核心）

- **由线条框出，半透明填充**：`border border-border bg-card rounded-lg`。
- 区域之间用 `border` 线条划分，不用 gap 留缝（线条本身是分隔）。
- 网格容器：`grid divide-x divide-y divide-border`（线条纵横划分单元格），或 `border border-border` 包裹 + 内部 `divide-y`。
- hover：`hover:bg-accent`（表面微亮）。
- 圆角 `rounded-lg`（8px）。
- 不用阴影做层次（见第 6 部分）。

### 按钮

- `primary`：`bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium`，hover `bg-primary/90`，active `scale-[0.98]`。
- `ghost`：`text-muted-foreground hover:bg-accent hover:text-foreground rounded-md px-3 py-1.5 text-sm`。
- `outline`：`border border-border rounded-md px-4 py-2 text-sm`，hover `bg-accent`。
- 圆角 `rounded-md`（6px）。
- 焦点：`focus-visible:ring-2 focus-visible:ring-ring`。

### 输入框

- `bg-card border border-border rounded-md px-3 py-2 text-sm`，placeholder `text-muted-foreground`。
- focus：`focus:ring-2 focus:ring-ring focus:border-primary`。
- 圆角 `rounded-md`（6px）。

### 导航栏

- 紧凑 `h-14`，`border-b border-border`（线条分隔），`bg-background/80 backdrop-blur-sm`。
- logo `text-base font-semibold`，链接 `text-sm`，active `text-foreground`，非 active `text-muted-foreground hover:text-foreground`。
- 非 sticky（博客场景）。

### 代码块

- `bg-code-bg rounded-lg border border-border`，标题栏（语言 + 复制）`bg-muted border-b border-border`。
- 代码 IBM Plex Mono `text-sm leading-6`。
- Shiki 双主题（github-light / github-dark），CSS 变量切换。

### 标签 / Badge

- `border border-border rounded-md px-2 py-0.5 text-xs`，active `bg-primary text-primary-foreground border-primary`。

### 交互状态（统一）

- hover：表面 `bg-accent`，文字 `text-foreground`，过渡 `150ms ease`。
- active：`scale-[0.98]`（tactile）。
- focus：`ring-2 ring-ring`。
- disabled：`opacity-50 pointer-events-none`。
- 全部尊重 `prefers-reduced-motion`。

---

## 5. 布局原则

**全屏网格骨架**（Tailwind 主页精髓）

- 页面占满视口：`min-h-dvh`，整体有冲击力，不零散。
- 纵横线条划分：用 `border` / `divide` 1px 浅线条把页面分成网格区域，区域由线条框出。
- 网格行用 1px 线条分隔：`grid-rows-[1fr_1px_auto_1px_auto]` 一类，1px 行做横线。
- gutter 留白：两侧 `px-6 md:px-12`（博客收窄，Tailwind 是 2.5rem gutter）。

**间距标准**（博客收窄）

- section 垂直间距：`py-8 md:py-12`（**比 Tailwind 主页 py-24 收窄**，博客重阅读）。
- 元素内间距：卡片 `p-5 ~ p-6`，按钮 `px-4 py-2`，输入 `px-3 py-2`。
- 元素间距：网格 `gap-4`（收窄），表单 `gap-2`，图标+文字 `gap-1.5`。

**栅格系统**

- 容器 `max-w-6xl`（1152px）居中，`px-6 md:px-12`。
- 正文 `max-w-3xl`（65ch）。
- 卡片网格：`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`，用 `divide-x divide-y divide-border` 线条划分（非 gap 缝），或 `gap-4` + 卡片各自 `border`。
- 双栏页（BlogList）：`lg:grid-cols-[220px_1fr]`，中间 `border-l border-border` 线条分隔。

**留白理念**

- 全屏骨架内留呼吸：区域间用线条 + 留白，不挤。
- 博客收窄：垂直 py-8~12，水平 px-6~12，比 Tailwind 主页紧凑。
- 线条划分的区域内部留白（p-5~6），不填满。

---

## 6. 深度与层次

**不用重阴影**。层次靠线条 + 半透明表面。

**表面层级**（z 轴从低到高）

1. `background`（页面底）— `#030712`
2. `card`（区域/卡片）— `bg-white/5` + `border border-border`（线条框出 + 半透明填充）
3. `popover`（弹层）— `bg-white/10` + `border border-border` + `backdrop-blur`（更亮 + 模糊）
4. `modal`（对话框）— `bg-white/10` + `backdrop-blur-md` + 遮罩 `bg-black/50`

**划分方式**

- 区域之间：1px 线条（`border` / `divide`），不用阴影。
- 区块之间：留白（py-8~12）+ 必要处 `border-b border-border` 横线。
- 列表行：`divide-y divide-border`。
- 网格单元格：`divide-x divide-y divide-border` 纵横线条。

**阴影**（极少）

- 仅 hover 极淡 `hover:shadow-sm`。
- 不用 `shadow-lg/xl`。

---

## 7. 设计准则与禁忌

**准则**

- 全屏网格骨架：页面占满 + 线条划分区域，不零散漂浮。
- 线条是骨架：1px 浅线条纵横划分，区域由线条框出。
- 半透明填充：区域用 `white/5` 镂空，不实心。
- 一致性：圆角（6/8px）、间距（4px 基准）、线条色（border token）全站统一。
- 双模式对比度：正文 WCAG AA（4.5:1），大字 3:1。
- 强调色克制：`#625fff` 仅用于 CTA/链接/焦点/active。

**禁忌**

- 不用零散漂浮卡片（必须有线条网格骨架组织）。
- 不用重阴影做层次（用线条 + 半透明）。
- 不用 glass 滥用（backdrop-blur 仅 popover/modal）。
- 不用 AI-purple 渐变（`#625fff` 单色强调，不作渐变背景）。
- 不用 em-dash（`—`），用句号/逗号/连字符。
- 不用 emoji 图标，用 Phosphor 图标库。
- 不用手写 SVG 图标。
- 不用纯黑 `#000000` / 纯白 `#ffffff`。
- 不混灰阶（只用 gray-950/white 透明度体系）。
- 不用三等分特征卡片、scroll cue、locale strip、版本号 footer 等装饰 tell。

---

## 8. 响应式行为

**断点**（Tailwind 默认）

- `sm` 640px / `md` 768px / `lg` 1024px / `xl` 1280px / `2xl` 1536px

**触控目标**

- 可点击元素最小 44×44px（移动端），`md:` 以上可缩到 32px。

**布局调整**

- `< md`（移动）：网格单列，侧栏隐藏（汉堡菜单），正文全宽，TOC 隐藏，纵横线条简化（保留必要分割线）。
- `md ~ lg`（平板）：网格 2 列，侧栏显示。
- `> lg`（桌面）：网格 3 列，双栏页侧栏 + 主区，TOC 显示，全屏网格骨架完整。
- 导航：`< md` 汉堡菜单，`md+` 横向链接。

**字号调整**

- Hero 名字：mobile `text-5xl`，desktop `text-6xl`。
- 页标题：mobile `text-4xl`，desktop `text-5xl`。
- 正文：全断点 `text-base`。

---

## 9. 智能体提示指南

**快速色彩参考**

```
background  #030712 (dark) / #fafafa (light)
foreground  #fafafa (dark) / #030712 (light)
primary     #625fff
card        bg-white/5 (dark) / bg-gray-950/5 (light)   ← 半透明镂空
border      white/10 (dark) / gray-950/10 (light)       ← 网格线条
muted-fg    #b8bfc6 (dark) / #6b7280 (light)
```

**可直接使用的提示语示例**

- 网格区域（线条框出 + 半透明填充）：
  `class="border border-border bg-card rounded-lg p-6"`
- 纵横线条划分网格单元格：
  `class="grid grid-cols-3 divide-x divide-y divide-border"`
- 全屏网格骨架：
  `class="min-h-dvh grid grid-rows-[auto_1fr_auto]"`
- 横线分隔区块：
  `class="border-t border-border pt-8"`
- 主按钮：
  `class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"`
- 输入框：
  `class="bg-card border border-border rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"`
- 导航栏：
  `class="h-14 border-b border-border bg-background/80 backdrop-blur-sm"`
- 代码块：
  `class="bg-code-bg rounded-lg border border-border overflow-hidden"`

**通用规则提示**

- 做区域/卡片：`border border-border` + `bg-card` + `rounded-lg`，线条框出 + 半透明填充，不用阴影。
- 划分网格：`divide-x divide-y divide-border`，1px 线条纵横分隔，不用 gap 缝。
- 全屏骨架：`min-h-dvh` 占满视口，用 grid + 1px 线条行组织。
- 收窄：博客 section `py-8 md:py-12`（非 Tailwind py-24），gutter `px-6 md:px-12`。
- 强调：`primary`（`#625fff`）只用在 CTA/链接/焦点/active。
- 圆角：小元素 `rounded-md`（6px），卡片/区域 `rounded-lg`（8px）。
- 图标：`@phosphor-icons/react`，统一 `weight="regular"`，不用 emoji / 手写 SVG。
