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
    <div className="min-h-screen bg-[#030712] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-x-hidden">
      {/* 🌌 Ambient Floating Orbs Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="fixed top-[40%] right-[30%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

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

