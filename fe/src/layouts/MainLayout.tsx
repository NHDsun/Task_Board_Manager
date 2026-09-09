import React, { useState } from 'react';
import { MeteorEdgeMenu } from '../components/navigation/MeteorEdgeMenu';
import { SolarisVoiceAssistantWidget } from '../components/voice/SolarisVoiceAssistantWidget';

interface MainLayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, currentRoute, onNavigate }) => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-x-hidden">
      {/* Subtle Dark Ambient Backdrop */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[300px] bg-indigo-950/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[300px] bg-amber-950/15 rounded-full blur-[180px] pointer-events-none" />

      {/* 🌠 Persistent Universal Meteor Edge Menu (Always Available Across All Views) */}
      <MeteorEdgeMenu
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        onOpenVoiceCommand={() => setIsVoiceModalOpen(true)}
      />

      {/* 🎙️ Universal Solaris Voice Assistant Modal Widget */}
      <SolarisVoiceAssistantWidget
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteCommand={(text) => {
          console.log('🎙️ Executing Voice Command:', text);
          // Sẽ kết nối Dispatcher ở Đợt 3.2 & 3.3
        }}
      />

      {/* Main Content Area with 16px Left Margin Padding */}
      <main className="pl-16 min-h-screen relative z-10 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

