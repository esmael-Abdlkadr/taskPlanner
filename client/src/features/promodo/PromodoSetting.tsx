import { useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import { usePomodoroStore } from "../../store/promodoStore";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import { Switch } from "../../components/ui/Switch";

interface PomodoroSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PomodoroSettings = ({
  isOpen,
  onClose,
}: PomodoroSettingsProps) => {
  const {
    workDuration,
    breakDuration,
    longBreakDuration,
    cycles,
    autoStartBreaks,
    autoStartPomodoros,
    alarmSound,
    alarmVolume,
    setSettings,
    resetToDefaults,
  } = usePomodoroStore();

  const [localSettings, setLocalSettings] = useState({
    workDuration,
    breakDuration,
    longBreakDuration,
    cycles,
    autoStartBreaks,
    autoStartPomodoros,
    alarmSound,
    alarmVolume,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleToggleChange = (name: string, value: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(localSettings);
    onClose();
  };

  const playSound = () => {
    if (localSettings.alarmSound === "none") return;

    const audio = new Audio(`/sounds/${localSettings.alarmSound}.mp3`);
    audio.volume = localSettings.alarmVolume / 100;
    audio.play();
  };

  const availableSounds = [
    { id: "none", name: "No Sound" },
    { id: "bell", name: "Bell" },
    { id: "digital", name: "Digital" },
    { id: "analog", name: "Analog" },
    { id: "notification", name: "Notification" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pomodoro Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Timer durations */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Work Duration (minutes)
              </label>
              <Input
                type="number"
                name="workDuration"
                min="1"
                max="120"
                value={localSettings.workDuration}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Break Duration (minutes)
              </label>
              <Input
                type="number"
                name="breakDuration"
                min="1"
                max="60"
                value={localSettings.breakDuration}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Long Break Duration (minutes)
              </label>
              <Input
                type="number"
                name="longBreakDuration"
                min="1"
                max="120"
                value={localSettings.longBreakDuration}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Cycles Before Long Break
              </label>
              <Input
                type="number"
                name="cycles"
                min="1"
                max="10"
                value={localSettings.cycles}
                onChange={handleChange}
              />
            </div>

       
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto-start Breaks</label>
              <Switch
                checked={localSettings.autoStartBreaks}
                onCheckedChange={(checked) =>
                  handleToggleChange("autoStartBreaks", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Auto-start Pomodoros
              </label>
              <Switch
                checked={localSettings.autoStartPomodoros}
                onCheckedChange={(checked) =>
                  handleToggleChange("autoStartPomodoros", checked)
                }
              />
            </div>

      
            <div>
              <label className="block text-sm font-medium mb-1">
                Alarm Sound
              </label>
              <select
                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700"
                name="alarmSound"
                value={localSettings.alarmSound}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    alarmSound: e.target.value,
                  }))
                }
              >
                {availableSounds.map((sound) => (
                  <option key={sound.id} value={sound.id}>
                    {sound.name}
                  </option>
                ))}
              </select>

              {localSettings.alarmSound !== "none" && (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={playSound}
                  >
                    Test Sound
                  </Button>
                </div>
              )}
            </div>

 
            <div>
              <label className="block text-sm font-medium mb-1">
                Alarm Volume
              </label>
              <div className="flex items-center">
                <VolumeX size={18} className="mr-2 text-gray-500" />
                <input
                  type="range"
                  name="alarmVolume"
                  min="0"
                  max="100"
                  value={localSettings.alarmVolume}
                  onChange={handleChange}
                  className="flex-1"
                />
                <Volume2 size={18} className="ml-2 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetToDefaults();
                onClose();
              }}
            >
              Reset to Defaults
            </Button>
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
