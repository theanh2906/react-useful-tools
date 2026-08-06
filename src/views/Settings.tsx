import { useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Settings as SettingsIcon,
  Palette,
  LayoutDashboard,
  Database,
  Moon,
  Sun,
  Globe,
  Download,
  Upload,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { useSettingsStore, DEFAULT_DASHBOARD_LAYOUT } from '@/stores/settingsStore';
import { DashboardLayoutItem } from '@/services/settingsService';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Settings() {
  const { t } = useTranslation();
  const { settings, updateSettings, importSettings } = useSettingsStore();
  const { theme, language } = useAppStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    updateSettings({ theme: newTheme });
  };

  const handleLanguageChange = (newLanguage: 'en' | 'vi') => {
    updateSettings({ language: newLanguage });
  };

  const handleLayoutToggle = (id: string) => {
    const layout = settings.dashboardLayout || DEFAULT_DASHBOARD_LAYOUT;
    const newLayout = layout.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    updateSettings({ dashboardLayout: newLayout });
  };

  const handleReorder = (newOrder: DashboardLayoutItem[]) => {
    const updatedLayout = newOrder.map((item, index) => ({
      ...item,
      order: index
    }));
    updateSettings({ dashboardLayout: updatedLayout });
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `user-settings_${user?.id || 'guest'}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      toast.success(t('success.saved'));
    } catch (error) {
      toast.error(t('errors.serverError'));
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // Basic validation
        if (typeof importedData === 'object' && importedData !== null) {
          await importSettings(importedData);
          toast.success(t('success.updated'));
        } else {
          throw new Error('Invalid format');
        }
      } catch (error) {
        toast.error(t('errors.validationError'));
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const layoutNames: Record<string, string> = {
    'quick-setup': t('settings.layoutNames.quickSetup', 'Quick Setup'),
    'stats-grid': t('settings.layoutNames.statsGrid', 'Stats Grid'),
    'quick-actions': t('settings.layoutNames.quickActions', 'Quick Actions'),
    'baby-age': t('settings.layoutNames.babyAge', 'Baby Age'),
    'recent-activity': t('settings.layoutNames.recentActivity', 'Recent Activity'),
    'todays-tip': t('settings.layoutNames.todaysTip', 'Today\'s Tip')
  };

  const sortedLayout = [...(settings.dashboardLayout || DEFAULT_DASHBOARD_LAYOUT)].sort((a, b) => a.order - b.order);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl space-y-5 pb-20"
    >
      <div className="mb-7 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-lg border border-accent-200 bg-accent-50">
          <SettingsIcon className="size-5 text-accent-600" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            {t('common.settings')}
          </h1>
          <p className="text-sm text-muted">
            {t('settings.subtitle', 'Customize your experience')}
          </p>
        </div>
      </div>

      {/* Appearance */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-2">
            <Palette className="size-5 text-primary-500" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t('settings.appearance', 'Appearance')}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Theme */}
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">{t('settings.theme', 'Theme')}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={cn(
                    "flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-3 font-medium transition-colors",
                    theme === 'light'
                      ? "border-accent-300 bg-accent-50 text-accent-700"
                      : "border-line bg-elevated text-muted hover:bg-surface hover:text-foreground"
                  )}
                >
                  <Sun className="w-4 h-4" />
                  {t('settings.light', 'Light')}
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={cn(
                    "flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-3 font-medium transition-colors",
                    theme === 'dark'
                      ? "border-accent-300 bg-accent-50 text-accent-700"
                      : "border-line bg-elevated text-muted hover:bg-surface hover:text-foreground"
                  )}
                >
                  <Moon className="w-4 h-4" />
                  {t('settings.dark', 'Dark')}
                </button>
              </div>
            </div>

            {/* Language */}
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">{t('settings.language', 'Language')}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={cn(
                    "flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 py-3 font-medium transition-colors sm:px-4",
                    language === 'en'
                      ? "border-accent-300 bg-accent-50 text-accent-700"
                      : "border-line bg-elevated text-muted hover:bg-surface hover:text-foreground"
                  )}
                >
                  <Globe className="w-4 h-4" />
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('vi')}
                  className={cn(
                    "flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 py-3 font-medium transition-colors sm:px-4",
                    language === 'vi'
                      ? "border-accent-300 bg-accent-50 text-accent-700"
                      : "border-line bg-elevated text-muted hover:bg-surface hover:text-foreground"
                  )}
                >
                  <Globe className="w-4 h-4" />
                  Tiếng Việt
                </button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Dashboard Layout */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="size-5 text-accent-600" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                {t('settings.dashboardLayout', 'Dashboard Layout')}
              </h2>
            </div>
            <Badge variant="info">{t('settings.customize', 'Customize')}</Badge>
          </div>

          <Reorder.Group 
            axis="y" 
            values={sortedLayout} 
            onReorder={handleReorder}
            className="divide-y divide-line border-y border-line"
          >
            {sortedLayout.map((item) => (
              <Reorder.Item 
                key={item.id}
                value={item}
                className="flex cursor-grab items-center justify-between gap-3 bg-elevated px-1 py-3 active:cursor-grabbing sm:px-2"
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleLayoutToggle(item.id)}
                    className={cn(
                      "rounded-md p-2 transition-colors",
                      item.visible ? "text-accent-600 hover:bg-accent-50" : "text-muted hover:bg-surface"
                    )}
                  >
                    {item.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <span className={cn(
                    "font-medium",
                    item.visible ? "text-foreground" : "text-muted line-through"
                  )}>
                    {layoutNames[item.id] || item.id}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-muted transition-colors hover:text-foreground">
                  <GripVertical className="w-5 h-5" />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={itemVariants}>
        <Card className="p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-2">
            <Database className="size-5 text-emerald-600" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t('settings.dataManagement', 'Data Management')}
            </h2>
          </div>

          <div className="grid divide-y divide-line border-y border-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="py-5 sm:pr-6">
              <h3 className="mb-2 font-medium text-foreground">{t('settings.backupSettings', 'Backup Settings')}</h3>
              <p className="mb-4 text-sm text-muted">
                {t('settings.backupDesc', 'Export your settings to a JSON file for safekeeping.')}
              </p>
              <Button onClick={handleExport} className="w-full flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                {t('settings.exportJson', 'Export JSON')}
              </Button>
            </div>

            <div className="py-5 sm:pl-6">
              <h3 className="mb-2 font-medium text-foreground">{t('settings.restoreSettings', 'Restore Settings')}</h3>
              <p className="mb-4 text-sm text-muted">
                {t('settings.restoreDesc', 'Import settings from a previously saved JSON file.')}
              </p>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden"
              />
              <Button 
                variant="secondary" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {t('settings.importJson', 'Import JSON')}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default Settings;
