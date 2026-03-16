# Failed HTML 项目 — babel 中文 JSON 筛查报告

> 生成时间：2026-03-16

## 概述

对 `failed html` 文件夹中失败的 HTML 文件进行分析，共涉及 **31 个项目**，分为两类：
- **无法打开**（2 个）：HTML 文件完全无法运行
- **部分未翻译为中文**（29 个）：HTML 可以打开，但界面部分内容仍显示英文

所有中文 JSON 文件均**语法正确**（无 JSON 解析错误），主要问题是 **翻译 key 缺失** 和 **key 名称与英文版不匹配（已过时）**。

---

## 一、无法打开的项目（2 个）

### 1. circuit-construction-kit-ac
| 指标 | 值 |
|------|-----|
| 英文 key 数 | 4 |
| 中文 key 数 | 1 |
| 翻译覆盖率 | **25.0%** |
| 缺失 key | `circuit-construction-kit-ac.title`, `screen.ac-voltage`, `screen.rlc` |

**问题**：中文 JSON 严重不完整，仅翻译了 1 个 key，连标题和屏幕名称都缺失。此外该项目还依赖 `circuit-construction-kit-common`（缺失 30 个 key），可能是导致无法打开的原因之一。

### 2. models-of-the-hydrogen-atom
| 指标 | 值 |
|------|-----|
| 英文 key 数 | 53 |
| 中文 key 数 | 52 |
| 翻译覆盖率 | **98.1%** |
| 缺失 key | `a11y` |
| 未翻译的值 | `symbolEquals`, `symbolEqualsValue`, `nlmEquals`（含模板变量的格式字符串） |

**问题**：仅缺失 `a11y`（无障碍访问）key。3 个"未翻译"的值实际上是包含 `{{symbol}}` 等模板变量的数学格式串，**不需要翻译**。该项目无法打开的原因可能不在翻译文件，而在构建或依赖问题。

---

## 二、部分未翻译为中文的项目（29 个）

### 问题严重程度分类

#### 🔴 严重缺失（翻译覆盖率 < 50%）

| 项目 | EN keys | ZH keys | 覆盖率 | 缺失数 |
|------|---------|---------|--------|--------|
| mean-share-and-balance | 48 | 8 | 16.7% | 42 |
| faradays-law | 18 | 5 | 27.8% | 13 |

#### 🟠 大量缺失（翻译覆盖率 50%-80%）

| 项目 | EN keys | ZH keys | 覆盖率 | 缺失数 |
|------|---------|---------|--------|--------|
| number-play | 19 | 10 | 52.6% | 9 |
| build-a-nucleus | 69 | 52 | 75.4% | 18 |
| circuit-construction-kit-dc | 4 | 3 | 75.0% | 1 |
| forces-and-motion-basics | 37 | 28 | 75.7% | 9 |
| build-an-atom | 38 | 30 | 78.9% | 10 |

#### 🟡 部分缺失（翻译覆盖率 80%-99%）

| 项目 | EN keys | ZH keys | 覆盖率 | 缺失数 |
|------|---------|---------|--------|--------|
| molecules-and-light | 34 | 29 | 85.3% | 6 |
| energy-forms-and-changes | 24 | 22 | 91.7% | 2 |
| ohms-law | 13 | 12 | 92.3% | 4 |
| gas-properties | 58 | 55 | 94.8% | 3 |
| charges-and-fields | 18 | 17 | 94.4% | 1 |
| capacitor-lab-basics | 22 | 21 | 95.5% | 2 |
| equality-explorer | 24 | 23 | 95.8% | 5 |
| molecule-polarity | 73 | 70 | 95.9% | 19 |

#### 🟢 key 完全匹配但存在其他问题

| 项目 | EN keys | ZH keys | 覆盖率 | 问题描述 |
|------|---------|---------|--------|----------|
| balancing-chemical-equations | 30 | 30 | 100.0% | key 名称不匹配：10个旧key需更新为新key |
| color-vision | 13 | 14 | 107.7% | key 名称不匹配：8个缺失，9个多余 |
| coulombs-law | 26 | 26 | 100.0% | 仅缺 `a11y` |
| gravity-force-lab | 24 | 49 | 204.2% | 26个过时的多余key，缺 `a11y` |
| ph-scale | 45 | 52 | 115.6% | 15个缺失，22个多余（key名大幅变更） |
| number-pairs | 54 | 61 | 113.0% | 仅缺 `gameScreen` 和 `a11y` |
| buoyancy | 6 | 6 | 100.0% | key 完全匹配 |
| buoyancy-basics | 2 | 2 | 100.0% | key 完全匹配 |
| unit-rates | 48 | 48 | 100.0% | key 完全匹配 |
| waves-intro | 4 | 4 | 100.0% | key 完全匹配 |
| fractions-equality | 3 | 3 | 100.0% | key 完全匹配 |
| fractions-intro | 4 | 4 | 100.0% | key 完全匹配 |
| fractions-mixed-numbers | 4 | 4 | 100.0% | key 完全匹配 |
| expression-exchange | 16 | 17 | 106.3% | 1个多余key |

---

## 三、公共依赖库的翻译缺失

以下公共库的翻译不完整，会影响**所有**依赖它们的项目：

| 公共库 | EN keys | ZH keys | 缺失数 | 影响的失败项目 |
|--------|---------|---------|--------|---------------|
| **shred** | 133 | 25 | **108** | build-an-atom, build-a-nucleus, isotopes-and-atomic-mass |
| **density-buoyancy-common** | 146 | 75 | **71** | buoyancy, buoyancy-basics |
| **circuit-construction-kit-common** | 79 | 49 | **30** | circuit-construction-kit-ac, circuit-construction-kit-dc |
| **joist** | 98 | 80 | **18** | 所有项目（框架库） |
| **number-suite-common** | 35 | 23 | **12** | number-play, number-pairs |
| **inverse-square-law-common** | 13 | 9 | **4** | coulombs-law, gravity-force-lab |
| **soccer-common** | 7 | 4 | **3** | mean-share-and-balance |
| **solar-system-common** | 17 | 16 | **1** | — |
| **number-line-common** | 2 | 1 | **1** | — |

> 注意：`scenery-phet` 中文有 92 个 key 而英文只有 37 个，说明中文 JSON 中有大量旧 key 需要清理更新。`vegas` 类似（ZH=38, EN=36）。

---

## 四、常见问题模式总结

### 1. key 名称不匹配（最常见）
英文源文件的 key 已经更新（如添加 `screen.` 前缀、使用 camelCase），但中文 JSON 仍使用旧的 key 名称。
- 典型案例：`balancing-chemical-equations`（`introduction` → `screen.intro`）、`color-vision`、`ph-scale`、`gravity-force-lab`

### 2. 缺少 `a11y` key
多个项目缺少 `a11y`（accessibility 无障碍）相关的翻译 key。这是英文源近期新增的 key。
- 涉及项目：models-of-the-hydrogen-atom, circuit-construction-kit-dc, coulombs-law, color-vision, gravity-force-lab, number-pairs, ph-scale 等

### 3. 缺少 `keyboardHelpDialog.*` key
键盘帮助对话框的翻译普遍缺失。
- 涉及项目：faradays-law, molecule-polarity, ph-scale, gas-properties, molecules-and-light 等

### 4. 整体翻译严重不足
部分项目的中文 JSON 翻译极度不完整。
- `mean-share-and-balance`：仅 16.7%
- `faradays-law`：仅 27.8%
- `number-play`：仅 52.6%

### 5. 值未翻译（少数）
极少数 key 虽然存在，但值仍为英文：
- `forces-and-motion-basics`: `"{0} Newtons"`, `"{0} m/s<sup>2</sup>"`
- `equality-explorer`: `"Solve for {{variable}}"`

---

## 五、buoyancy / buoyancy-basics / unit-rates / waves-intro / fractions-* 的说明

这些项目自身的中文 JSON key **完全匹配**英文，翻译覆盖率 100%。它们出现在"部分未翻译"列表中，原因很可能是**公共依赖库**的翻译不完整：
- `buoyancy` / `buoyancy-basics` → 依赖 `density-buoyancy-common`（缺失 71 个 key）
- `fractions-*` → 依赖 `fractions-common`（完整）但可能依赖 `joist`（缺失 18 key）
- 所有项目 → 依赖 `joist`（缺失 18 key）、`scenery-phet`（key 不匹配）