import { useState } from "react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

const predefinedColors = [
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#6B7280", // Gray
];

export const ColorPicker = ({
  color,
  onChange,
  disabled = false,
}: ColorPickerProps) => {
  const [customColor, setCustomColor] = useState(color);

  const handleColorClick = (newColor: string) => {
    if (!disabled) {
      onChange(newColor);
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      const newColor = e.target.value;
      setCustomColor(newColor);
      onChange(newColor);
    }
  };

  return (
    <div className={`space-y-4 ${disabled ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap gap-3">
        {predefinedColors.map((presetColor) => (
          <button
            key={presetColor}
            type="button"
            onClick={() => handleColorClick(presetColor)}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              color === presetColor ? "ring-2 ring-offset-2 ring-primary" : ""
            }`}
            style={{ backgroundColor: presetColor }}
            aria-label={`Select color ${presetColor}`}
            disabled={disabled}
          >
            {color === presetColor && (
              <span className="text-white text-xs">✓</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded flex-shrink-0"
          style={{ backgroundColor: customColor }}
        ></div>
        <input
          type="color"
          value={customColor}
          onChange={handleCustomColorChange}
          className="w-full h-10 cursor-pointer"
          id="custom-color-picker"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
