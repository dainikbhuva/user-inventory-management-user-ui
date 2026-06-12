import { UserLayout } from '../../../components/layout/Layout';
import { useTheme, type ThemeAccent, type ThemeMode } from '../../../shared/theme/useTheme';
import { Button } from '../../../components/ui/Button';
import { useState } from 'react';

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

export const SettingsPage = () => {
  const { accent, mode, setAccent, setMode } = useTheme();
  const [selectedAccent, setSelectedAccent] = useState<ThemeAccent>(accent);
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(mode);

  const handleSave = () => {
    setAccent(selectedAccent);
    setMode(selectedMode);
  };

  const hasChanges = selectedAccent !== accent || selectedMode !== mode;

  return (
    <UserLayout title="Settings" subtitle="Customize the app theme and accent color">
      <div className="grid gap-6">
        <section className="rounded-sm border border-base bg-surface p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-body">Theme settings</p>
              <p className="text-sm text-muted mt-1">Choose a site accent and light/dark mode.</p>
            </div>
            <Button
              type="button"
              variant="default"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save changes
            </Button>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-body">Accent color</h3>
              <div className="flex flex-wrap gap-3">
                {themeColors.map((item) => (
                  <button
                    key={item.accent}
                    type="button"
                    onClick={() => setSelectedAccent(item.accent)}
                    className={`h-12 w-12 rounded-sm border-2 transition-all ${
                      selectedAccent === item.accent
                        ? 'border-primary shadow-soft ring-2 ring-primary/20'
                        : 'border-base hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: item.color }}
                    aria-label={item.label}
                  />
                ))}
              </div>
              {selectedAccent !== accent && (
                <p className="text-xs text-muted">Current: {themeColors.find(c => c.accent === accent)?.label}</p>
              )}
            </div>

            <div className="space-y-4">
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
              {selectedMode !== mode && (
                <p className="text-xs text-muted">Current: {themeModes.find(m => m.value === mode)?.label}</p>
              )}
            </div>
          </div>

          {hasChanges && (
            <div className="mt-6 rounded-sm bg-primary-soft border border-primary-soft p-4">
              <p className="text-sm text-primary font-medium">You have unsaved changes</p>
              <p className="text-xs text-primary/80 mt-1">Click "Save changes" to apply your theme settings.</p>
            </div>
          )}
        </section>
      </div>
    </UserLayout>
  );
};
