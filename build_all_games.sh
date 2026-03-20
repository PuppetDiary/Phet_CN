#!/bin/bash
# 批量构建 PhET 游戏的中文版本

# 设置工作目录
cd "$(dirname "$0")"

# 需要构建的项目列表
PROJECTS=(
    "acid-base-solutions"
    "area-builder"
    "area-model-algebra"
    "area-model-decimals"
    "area-model-introduction"
    "area-model-multiplication"
    "arithmetic"
    "atomic-interactions"
    "balancing-chemical-equations"
    "balloons-and-static-electricity"
    "beers-law-lab"
    "bending-light"
    "blackbody-spectrum"
    "build-a-fraction"
    "build-a-molecule"
    "build-an-atom"
    "buoyancy-basics"
    "calculus-grapher"
    "capacitor-lab-basics"
    "center-and-variability"
    "charges-and-fields"
    "circuit-construction-kit-ac"
    "circuit-construction-kit-dc"
    "collision-lab"
    "color-vision"
    "concentration"
    "coulombs-law"
    "curve-fitting"
    "diffusion"
    "energy-forms-and-changes"
    "energy-skate-park-basics"
    "energy-skate-park"
    "equality-explorer-basics"
    "equality-explorer-two-variables"
    "equality-explorer"
    "expression-exchange"
    "faradays-law"
    "forces-and-motion-basics"
    "fourier-making-waves"
    "fraction-matcher"
    "fractions-equality"
    "friction"
    "function-builder-basics"
    "function-builder"
    "gas-properties"
    "gases-intro"
    "gene-expression-essentials"
    "geometric-optics-basics"
    "geometric-optics"
    "graphing-lines"
    "graphing-quadratics"
    "graphing-slope-intercept"
    "gravity-and-orbits"
    "gravity-force-lab-basics"
    "gravity-force-lab"
    "greenhouse-effect"
    "hookes-law"
    "isotopes-and-atomic-mass"
    "john-travoltage"
    "keplers-laws"
    "least-squares-regression"
    "make-a-ten"
    "masses-and-springs-basics"
    "masses-and-springs"
    "mean-share-and-balance"
    "membrane-transport"
    "models-of-the-hydrogen-atom"
    "molarity"
    "molecule-polarity"
    "molecule-shapes-basics"
    "molecule-shapes"
    "molecules-and-light"
    "my-solar-system"
    "natural-selection"
    "neuron"
    "normal-modes"
    "number-compare"
    "number-line-distance"
    "number-line-integers"
    "number-line-operations"
    "number-pairs"
    "number-play"
    "ohms-law"
    "pendulum-lab"
    "ph-scale-basics"
    "ph-scale"
    "plinko-probability"
    "projectile-data-lab"
    "projectile-motion"
    "proportion-playground"
    "quadrilateral"
    "quantum-coin-toss"
    "quantum-measurement"
    "ratio-and-proportion"
    "reactants-products-and-leftovers"
    "resistance-in-a-wire"
    "states-of-matter-basics"
    "states-of-matter"
    "trig-tour"
    "under-pressure"
    "unit-rates"
    "vector-addition-equations"
    "vector-addition"
    "wave-interference"
    "wave-on-a-string"
    "waves-intro"
)

OUTPUT_DIR="game-new"
mkdir -p "$OUTPUT_DIR"

TOTAL=${#PROJECTS[@]}
CURRENT=0
SUCCESS=0
FAILED=0

echo "开始构建 $TOTAL 个项目..."
echo "========================================"

for PROJECT in "${PROJECTS[@]}"; do
    CURRENT=$((CURRENT + 1))
    echo "[$CURRENT/$TOTAL] 构建 $PROJECT..."
    
    if [ ! -d "$PROJECT" ]; then
        echo "  跳过: 目录不存在"
        continue
    fi
    
    cd "$PROJECT"
    
    # 创建 build-local.json 跳过 lint
    echo '{"skipLint": true}' > build-local.json 2>/dev/null
    
    # 构建中文版
    npx grunt --brands=adapted-from-phet --locales=zh_CN --lint=false 2>&1 | tail -5
    
    # 检查构建结果
    HTML_FILE="build/adapted-from-phet/${PROJECT}_zh_CN_adapted-from-phet.html"
    if [ -f "$HTML_FILE" ]; then
        cp "$HTML_FILE" "../$OUTPUT_DIR/"
        echo "  ✓ 成功"
        SUCCESS=$((SUCCESS + 1))
    else
        echo "  ✗ 失败"
        FAILED=$((FAILED + 1))
    fi
    
    cd ..
    echo ""
done

echo "========================================"
echo "构建完成！"
echo "成功: $SUCCESS"
echo "失败: $FAILED"
echo "输出目录: $OUTPUT_DIR"
