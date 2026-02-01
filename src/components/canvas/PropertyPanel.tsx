import { useEffect, useState } from "react";
import * as fabric from "fabric";
import { useEditorStore } from "../../stores/editorStore";
import type { ObjectProperties } from "../../types";

interface PropertyPanelProps {
  canvas: fabric.Canvas | null;
}

/**
 * プロパティパネルコンポーネント
 * 選択したオブジェクトのプロパティ編集機能を提供
 * レスポンシブ対応: 開閉状態に応じて表示/非表示を切り替え
 */
export function PropertyPanel({ canvas }: PropertyPanelProps) {
  const { selectedObjectIds, isPropertyPanelOpen } = useEditorStore();
  const [properties, setProperties] = useState<ObjectProperties | null>(null);

  // パネルが閉じている場合は非表示
  if (!isPropertyPanelOpen) {
    return null;
  }

  useEffect(() => {
    if (!canvas || selectedObjectIds.length === 0) {
      setProperties(null);
      return;
    }

    const obj = canvas.getActiveObject();
    if (!obj) return;

    setProperties({
      left: Math.round(obj.left || 0),
      top: Math.round(obj.top || 0),
      width: Math.round(obj.width * (obj.scaleX || 1)),
      height: Math.round(obj.height * (obj.scaleY || 1)),
      angle: Math.round(obj.angle || 0),
      fill: (obj.fill as string) || "#000000",
      opacity: obj.opacity || 1,
    });
  }, [canvas, selectedObjectIds]);

  const updateProperty = (key: keyof ObjectProperties, value: string | number) => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;

    if (key === "width" || key === "height") {
      // Handle size changes by scaling
      if (key === "width") {
        const newScaleX = (Number(value) / obj.width);
        obj.set({ scaleX: newScaleX });
      } else {
        const newScaleY = (Number(value) / obj.height);
        obj.set({ scaleY: newScaleY });
      }
    } else {
      obj.set({ [key]: value });
    }
    canvas.renderAll();
  };

  if (!properties) {
    return (
      <div className="w-56 lg:w-64 p-4 border-l dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm">
        オブジェクトを選択してください
      </div>
    );
  }

  return (
    <div className="w-56 lg:w-64 p-4 border-l dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
      <h3 className="font-bold mb-4">プロパティ</h3>

      <div className="space-y-4">
        {/* 位置 */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">位置 (X, Y)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={properties.left}
              onChange={(e) => updateProperty("left", Number(e.target.value))}
              className="w-full border dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="number"
              value={properties.top}
              onChange={(e) => updateProperty("top", Number(e.target.value))}
              className="w-full border dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        {/* サイズ */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">サイズ (W, H)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={properties.width}
              onChange={(e) => updateProperty("width", Number(e.target.value))}
              className="w-full border dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100"
            />
            <input
              type="number"
              value={properties.height}
              onChange={(e) => updateProperty("height", Number(e.target.value))}
              className="w-full border dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        {/* 回転 */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">回転 ({properties.angle}°)</label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={properties.angle}
            onChange={(e) => updateProperty("angle", Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* 塗りつぶし色 */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">塗りつぶし</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={properties.fill || "#000000"}
              onChange={(e) => updateProperty("fill", e.target.value)}
              className="w-10 h-8 border dark:border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={properties.fill}
              onChange={(e) => updateProperty("fill", e.target.value)}
              className="flex-1 border dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        {/* 透明度 */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
            透明度 ({Math.round(properties.opacity * 100)}%)
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={properties.opacity}
            onChange={(e) => updateProperty("opacity", Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
