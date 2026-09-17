import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { Sidebar } from './Sidebar';
import { TitleBar } from './TitleBar';
import { WelcomeView } from '../views/WelcomeView';
import { AIEnhancementsView } from '../views/AIEnhancementsView';
import { RewriteModeView } from '../views/RewriteModeView';
import { CommandModeView } from '../views/CommandModeView';
import { MeetingTranscriptionView } from '../views/MeetingTranscriptionView';
import { CustomDictionaryView } from '../views/CustomDictionaryView';
import { StatsView } from '../views/StatsView';
import { TranscriptionHistoryView } from '../views/TranscriptionHistoryView';
import { ChangelogView } from '../views/ChangelogView';
import { FeedbackView } from '../views/FeedbackView';
import { PreferencesView } from '../views/PreferencesView';
import { SettingsModal } from '../settings/SettingsModal';

export const Dashboard: React.FC = () => {
  const { activeTab } = useAppStore();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'welcome':
        return <WelcomeView />;
      case 'aiSettings':
      case 'aiEnhancements':
      case 'voiceEngine':
        return <AIEnhancementsView />;
      case 'commandMode':
        return <CommandModeView />;
      case 'writeMode':
      case 'rewriteMode':
      case 'cleanupStyles':
        return <RewriteModeView />;
      case 'fileTranscription':
      case 'meetingTools':
        return <MeetingTranscriptionView />;
      case 'customDictionary':
        return <CustomDictionaryView />;
      case 'stats':
        return <StatsView />;
      case 'history':
        return <TranscriptionHistoryView />;
      case 'preferences':
        return <PreferencesView />;
      case 'changelog':
        return <ChangelogView />;
      case 'feedback':
        return <FeedbackView />;
      default:
        return <WelcomeView />;
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#000000] text-[#ededed] overflow-hidden select-none">
      {/* Main App Titlebar */}
      <TitleBar />

      {/* Main App Body Split (Sidebar + Active View) */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden bg-[#000000] flex flex-col">
          {renderActiveView()}
        </main>
      </div>

      {/* Preferences Modal */}
      <SettingsModal />
    </div>
  );
};
