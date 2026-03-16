# PhET 模拟器复现待办清单

> 基于 `Phet游戏清单.md` 中提取的 118 个不重复游戏 (2026-03-16 更新)
> 已按照 [1. PhET 模拟器复现标准化工作流.md](./1.%20PhET%20模拟器复现标准化工作流.md) 改造完成的标注为 ✅

---

## ✅ 已完成 (108)

### 物理 Physics (53)

- [x] forces-and-motion-basics
- [x] balancing-act
- [x] friction
- [x] gravity-force-lab-basics
- [x] gravity-force-lab
- [x] gravity-and-orbits
- [x] my-solar-system
- [x] energy-skate-park-basics
- [x] energy-skate-park
- [x] energy-forms-and-changes
- [x] waves-intro
- [x] wave-interference
- [x] wave-on-a-string
- [x] fourier-making-waves
- [x] bending-light
- [x] geometric-optics-basics
- [x] geometric-optics
- [x] color-vision
- [x] circuit-construction-kit-dc
- [x] circuit-construction-kit-ac
- [x] capacitor-lab-basics
- [x] ohms-law
- [x] resistance-in-a-wire
- [x] faradays-law
- [x] balloons-and-static-electricity
- [x] john-travoltage
- [x] charges-and-fields
- [x] states-of-matter-basics
- [x] states-of-matter
- [x] gases-intro
- [x] gas-properties
- [x] diffusion
- [x] blackbody-spectrum
- [x] buoyancy-basics
- [x] buoyancy
- [x] density
- [x] under-pressure
- [x] quantum-coin-toss
- [x] quantum-measurement
- [x] models-of-the-hydrogen-atom
- [x] build-a-nucleus
- [x] atomic-interactions
- [x] molecules-and-light
- [x] projectile-motion
- [x] projectile-data-lab
- [x] pendulum-lab
- [x] masses-and-springs-basics
- [x] masses-and-springs
- [x] hookes-law
- [x] collision-lab
- [x] vector-addition
- [x] calculus-grapher
- [x] curve-fitting

### 数学与统计 Math & Statistics (36)

- [x] arithmetic
- [x] number-play
- [x] number-compare
- [x] number-pairs
- [x] make-a-ten
- [x] number-line-distance
- [x] number-line-operations
- [x] number-line-integers
- [x] fractions-intro
- [x] fractions-equality
- [x] fractions-mixed-numbers
- [x] build-a-fraction
- [x] fraction-matcher
- [x] area-builder
- [x] expression-exchange
- [x] equality-explorer-basics
- [x] equality-explorer
- [x] equality-explorer-two-variables
- [x] area-model-algebra
- [x] area-model-decimals
- [x] area-model-multiplication
- [x] area-model-introduction
- [x] function-builder-basics
- [x] function-builder
- [x] graphing-lines
- [x] graphing-slope-intercept
- [x] graphing-quadratics
- [x] ratio-and-proportion
- [x] proportion-playground
- [x] unit-rates
- [x] quadrilateral
- [x] plinko-probability
- [x] mean-share-and-balance
- [x] center-and-variability
- [x] least-squares-regression
- [x] trig-tour

### 化学 Chemistry (14)

- [x] acid-base-solutions
- [x] ph-scale-basics
- [x] ph-scale
- [x] build-an-atom
- [x] isotopes-and-atomic-mass
- [x] build-a-molecule
- [x] molecule-shapes-basics
- [x] molecule-shapes
- [x] molecule-polarity
- [x] balancing-chemical-equations
- [x] reactants-products-and-leftovers
- [x] concentration
- [x] molarity
- [x] beers-law-lab

### 地球与空间 Earth & Space (1)

- [x] greenhouse-effect

### 生物 Biology (4)

- [x] membrane-transport
- [x] natural-selection
- [x] gene-expression-essentials
- [x] neuron

---

## ⏭️ 已跳过 (7)

> 这些游戏在118个清单中存在，但因依赖问题、仓库不存在或缺少中文字符串等原因被跳过

- [x] generator (跳过 - 依赖问题)
- [x] magnets-and-electromagnets (跳过 - 依赖问题)
- [x] magnet-and-compass (跳过 - 依赖问题)
- [x] faraday-electromagnetic-lab (跳过 - 仓库不存在)
- [x] circuit-construction-kit-dc-virtual-lab (跳过 - 依赖不支持)
- [x] coulomb-law (跳过 - 仓库不存在)
- [x] rutherford-scattering (跳过 - 缺少中文字符串)

### 不在118个清单中的已跳过项

- [x] circuit-construction-kit-ac-virtual-lab (跳过 - 依赖不支持，且不在游戏清单中)

---

## 📋 待处理 (3)

> 以下是从 `Phet游戏清单.md` 中新发现的、尚未处理的游戏

### 物理 Physics

- [ ] forces-and-motion
- [ ] keplers-laws

### 数学与统计 Math & Statistics

- [ ] projectile-sampling-distributions

### 跨学科/其他（在 todo 中有但不在清单的118个中）

> 以下游戏在之前的 phet_catalog.json 中存在，但不在 Phet游戏清单.md 的118个去重游戏中

- [x] vector-addition-equations (已完成，但不在游戏清单中)

---

## 📊 统计

| 状态 | 数量 |
|------|------|
| ✅ 已完成 | 108 |
| ⏭️ 已跳过（清单内） | 7 |
| 📋 待处理 | 3 |
| **清单总游戏数（去重）** | **118** |
| 验证：108 + 7 + 3 | = 118 ✓ |

> **说明**：`Phet游戏清单.md` 中声称有 185 个游戏，但实际上许多游戏在不同学科分类中被重复列出，去重后实际为 **118 个独立游戏**。

---

## 更新日志

- **2026-03-16**: 根据 `Phet游戏清单.md` 重新整理，确认118个不重复游戏，按学科重新分类
- **2026-03-11**: 初始版本，从 phet_catalog.json 提取
- **2026-03-11**: 完成 quantum-measurement 和 quantum-coin-toss 的中文版构建
- **2026-03-12**: 替换Logo为国科信Logo，完成 models-of-the-hydrogen-atom、buoyancy-basics、buoyancy、blackbody-spectrum 中文版构建
- **2026-03-13**: 完成 gas-properties、gravity-and-orbits、my-solar-system 中文版构建
- **2026-03-13**: 完成 natural-selection 中文版构建
- **2026-03-13**: 完成 gene-expression-essentials 中文版构建
- **2026-03-13**: 完成 neuron、greenhouse-effect 中文版构建
- **2026-03-13**: 完成能量类、波动类、碰撞类、光学类等多个模拟器中文版构建
- **2026-03-13**: 完成化学类14个模拟器中文版构建 (membrane-transport, build-a-molecule, molecule-polarity, isotopes-and-atomic-mass, molecule-shapes, molecule-shapes-basics, reactants-products-and-leftovers, ph-scale-basics, ph-scale, balancing-chemical-equations, acid-base-solutions, concentration, beers-law-lab, molarity)
- **2026-03-13**: 完成 build-an-atom 中文版构建
- **2026-03-13**: 完成 resistance-in-a-wire 中文版构建
- **2026-03-13**: 完成 ohms-law 中文版构建
- **2026-03-13**: 完成 balloons-and-static-electricity 中文版构建
- **2026-03-13**: 完成 gravity-force-lab 中文版构建
- **2026-03-13**: 完成 john-travoltage 中文版构建
- **2026-03-13**: 完成 friction 中文版构建
- **2026-03-13**: 完成 under-pressure 中文版构建
- **2026-03-13**: 完成 balancing-act 中文版构建
- **2026-03-13**: 完成 color-vision 中文版构建
- **2026-03-13**: 完成 wave-on-a-string 中文版构建
- **2026-03-13**: 完成 faradays-law 中文版构建
- **2026-03-13**: 完成 energy-skate-park-basics 中文版构建
- **2026-03-13**: 完成 molecules-and-light 中文版构建
- **2026-03-13**: 完成 hookes-law 中文版构建
- **2026-03-13**: 完成 bending-light 中文版构建
- **2026-03-13**: 完成 charges-and-fields 中文版构建
- **2026-03-13**: 完成 atomic-interactions 中文版构建
- **2026-03-13**: 完成 plinko-probability 中文版构建
- **2026-03-13**: 完成 states-of-matter 中文版构建
- **2026-03-13**: 完成 states-of-matter-basics 中文版构建
- **2026-03-13**: 完成 projectile-motion 中文版构建
- **2026-03-13**: 完成 pendulum-lab 中文版构建
- **2026-03-13**: 完成 circuit-construction-kit-dc 中文版构建
- **2026-03-13**: 完成 capacitor-lab-basics 中文版构建
- **2026-03-13**: 完成 masses-and-springs 中文版构建
- **2026-03-13**: 完成 masses-and-springs-basics 中文版构建
- **2026-03-13**: 完成数学类10个模拟器中文版构建 (number-pairs, mean-share-and-balance, center-and-variability, quadrilateral, number-compare, number-play, number-line-distance, ratio-and-proportion, number-line-operations, number-line-integers)
