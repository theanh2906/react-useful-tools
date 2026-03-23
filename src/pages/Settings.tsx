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
import { useSettingsStore, DEFAULT_DASHBOARD_LAYOUT, DashboardLayoutItem } from '@/stores/settingsStore';
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
      className="max-w-4xl mx-auto space-y-6 pb-20"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
            {t('common.settings')}
          </h1>
          <p className="text-slate-400">
            {t('settings.subtitle', 'Customize your experience')}
          </p>
        </div>
      </div>

      {/* Appearance */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-display font-semibold text-white">
              {t('settings.appearance', 'Appearance')}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Theme */}
            <div>
              <p className="text-sm font-medium text-slate-300 mb-3">{t('settings.theme', 'Theme')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all",
                    theme === 'light' 
                      ? "bg-primary-500/20 border-primary-500 text-white" 
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  )}
                >
                  <Sun className="w-4 h-4" />
                  {t('settings.light', 'Light')}
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all",
                    theme === 'dark' 
                      ? "bg-primary-500/20 border-primary-500 text-white" 
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  )}
                >
                  <Moon className="w-4 h-4" />
                  {t('settings.dark', 'Dark')}
                </button>
              </div>
            </div>

            {/* Language */}
            <div>
              <p className="text-sm font-medium text-slate-300 mb-3">{t('settings.language', 'Language')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all",
                    language === 'en' 
                      ? "bg-primary-500/20 border-primary-500 text-white" 
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  )}
                >
                  <Globe className="w-4 h-4" />
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('vi')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all",
                    language === 'vi' 
                      ? "bg-primary-500/20 border-primary-500 text-white" 
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-display font-semibold text-white">
                {t('settings.dashboardLayout', 'Dashboard Layout')}
              </h2>
            </div>
            <Badge variant="info">{t('settings.customize', 'Customize')}</Badge>
          </div>

          <Reorder.Group 
            axis="y" 
            values={sortedLayout} 
            onReorder={handleReorder}
            className="space-y-3"
          >
            {sortedLayout.map((item) => (
              <Reorder.Item 
                key={item.id}
                value={item}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleLayoutToggle(item.id)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      item.visible ? "text-primary-400 hover:bg-primary-500/10" : "text-slate-500 hover:bg-white/10"
                    )}
                  >
                    {item.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <span className={cn(
                    "font-medium",
                    item.visible ? "text-white" : "text-slate-500 line-through"
                  )}>
                    {layoutNames[item.id] || item.id}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-display font-semibold text-white">
              {t('settings.dataManagement', 'Data Management')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-medium text-white mb-2">{t('settings.backupSettings', 'Backup Settings')}</h3>
              <p className="text-sm text-slate-400 mb-4">
                {t('settings.backupDesc', 'Export your settings to a JSON file for safekeeping.')}
              </p>
              <Button onClick={handleExport} className="w-full flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                {t('settings.exportJson', 'Export JSON')}
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-medium text-white mb-2">{t('settings.restoreSettings', 'Restore Settings')}</h3>
              <p className="text-sm text-slate-400 mb-4">
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
                variant="outline" 
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