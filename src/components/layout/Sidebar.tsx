import {
  Home,
  Sparkles,
  Terminal,
  Pen,
  FileText,
  BarChart3,
  Clock,
  Sliders,
  MessageSquare,
} from 'lucide-react';
import { useAppStore, SidebarTab } from '../../stores/appStore';

interface NavItem {
  id: SidebarTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'welcome', label: 'Welcome', icon: Home },
  { id: 'aiSettings', label: 'AI Settings', icon: Sparkles },
  { id: 'commandMode', label: 'Command Mode', icon: Terminal },
  { id: 'writeMode', label: 'Write Mode', icon: Pen },
  { id: 'fileTranscription', label: 'File Transcription', icon: FileText },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <aside className="w-60 h-full flex flex-col justify-between bg-[#0a0a0a] border-r border-[#222222] select-none p-3">
      {/* App Logo & Header */}
      <div>
        <div className="flex items-center gap-3 px-3 py-3 mb-2" data-tauri-drag-region>
          <div className="w-7 h-7 rounded-md bg-[#171717] border border-[#2e2e2e] flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-tight">DN</span>
          </div>
          <div>
            <h1 className="text-xs font-semibold text-[#ededed] tracking-tight flex items-center gap-1.5">
              DopeNotch
              <span className="text-[9px] uppercase font-mono font-medium px-1 py-0.2 rounded bg-[#1c1c1c] text-zinc-300 border border-[#2e2e2e]">
                TOP-NOTCH
              </span>
            </h1>
            <p className="text-[11px] text-zinc-500">Dictation & Clipboard</p>
          </div>
        </div>

        {/* Navigation Item List */}
        <nav className="space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === 'aiSettings' && (activeTab === 'voiceEngine' || activeTab === 'aiEnhancements')) ||
              (item.id === 'writeMode' && (activeTab === 'rewriteMode' || activeTab === 'cleanupStyles')) ||
              (item.id === 'fileTranscription' && activeTab === 'meetingTools');

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors duration-100 ${
                  isActive
                    ? 'bg-[#1a1a1a] text-[#ededed] border border-[#2e2e2e] font-medium'
                    : 'text-zinc-400 hover:text-[#ededed] hover:bg-[#121212]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#ededed]' : 'text-zinc-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? 'bg-[#262626] text-zinc-200'
                        : 'bg-[#171717] text-zinc-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="px-3 py-2 border-t border-[#1f1f1f] text-[11px] text-zinc-500 flex items-center justify-between">
        <span>DopeNotch v0.4.0</span>
        <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          On-Device Ready
        </span>
      </div>
    </aside>
  );
};
