#!/bin/bash
# Steve Buddy Addon 打包脚本
# 将 addon 文件夹打包成 .mcpack 文件

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADDON_DIR="$SCRIPT_DIR/addon"
OUTPUT_DIR="$SCRIPT_DIR/dist"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

echo "📦 正在打包 Steve Buddy Addon..."

# 打包行为包
echo "  → 打包行为包..."
cd "$ADDON_DIR/behavior_packs/steve_buddy"
zip -r "$OUTPUT_DIR/Steve_Buddy_Behavior.mcpack" . -x "*.DS_Store"

# 打包资源包
echo "  → 打包资源包..."
cd "$ADDON_DIR/resource_packs/steve_buddy"
zip -r "$OUTPUT_DIR/Steve_Buddy_Resource.mcpack" . -x "*.DS_Store"

echo ""
echo "✅ 打包完成！"
echo ""
echo "生成的文件："
echo "  📁 $OUTPUT_DIR/Steve_Buddy_Behavior.mcpack"
echo "  📁 $OUTPUT_DIR/Steve_Buddy_Resource.mcpack"
echo ""
echo "使用方法："
echo "  1. 在 Minecraft Bedrock 中打开"
echo "  2. 设置 → 资源包 → 我的资源包 → 导入"
echo "  3. 导入 .mcpack 文件"
echo "  4. 启用资源包和行为包"
echo "  5. 使用命令: /summon steve:buddy"
echo ""
