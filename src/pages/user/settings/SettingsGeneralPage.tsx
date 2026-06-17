import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { useTheme, type ThemeAccent, type ThemeMode } from '../../../shared/theme/useTheme';

const themeColors: Array<{ accent: ThemeAccent; label: string; color: string }> = [
  { accent: 'blue', label: 'Blue', color: '#3b82f6' },
  { accent: 'green', label: 'Green', color: '#10b981' },
  { accent: 'purple', label: 'Purple', color: '#8b5cf6' },
  { accent: 'orange', label: 'Orange', color: '#f97316' },
  { accent: 'teal', label: 'Teal', color: '#14b8a6' },
];

const themeModes: Array<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export const SettingsGeneralPage = () => {
  const { accent, mode, setAccent, setMode } = useTheme();
  const [selectedAccent, setSelectedAccent] = useState<ThemeAccent>(accent);
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(mode);

  const handleSave = () => {
    setAccent(selectedAccent);
    setMode(selectedMode);
  };

  const hasChanges = selectedAccent !== accent || selectedMode !== mode;

  return (
    <div className="rounded-sm border border-base bg-surface shadow-sm">
      <div className="border-b border-base px-6 py-4">
        <h2 className="text-lg font-semibold text-body">Appearance</h2>
        <p className="mt-1 text-sm text-muted">Customize accent color and light or dark mode for your workspace.</p>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-body">Accent color</h3>
            <div className="flex flex-wrap gap-3">
              {themeColors.map((item) => (
                <button
                  key={item.accent}
                  type="button"
                  onClick={() => setSelectedAccent(item.accent)}
                  className={`h-11 w-11 rounded-sm border-2 transition-all ${
                    selectedAccent === item.accent
                      ? 'border-primary shadow-soft ring-2 ring-primary/20'
                      : 'border-base hover:border-primary/50'
                  }`}
                  style={{ backgroundColor: item.color }}
                  aria-label={item.label}
                  title={item.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-body">Theme mode</h3>
            <select
              value={selectedMode}
              onChange={(event) => setSelectedMode(event.target.value as ThemeMode)}
              className="w-full rounded-sm border border-base bg-surface px-4 py-3 text-body outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
            >
              {themeModes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasChanges && (
          <div className="rounded-sm border border-primary/20 bg-primary-soft p-4">
            <p className="text-sm font-medium text-primary">You have unsaved changes</p>
          </div>
        )}

        <div className="flex justify-end border-t border-base pt-4">
          <Button type="button" onClick={handleSave} disabled={!hasChanges}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
};
