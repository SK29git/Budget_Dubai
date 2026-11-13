import React from 'react';
import { Phone, MessageSquare, Mail } from 'lucide-react';
import { useWorkspace, CommMode } from '../../context/WorkspaceContext';
import { PhoneCommunication } from './PhoneCommunication';
import { ChatCommunication } from './ChatCommunication';
import { EmailCommunication } from './EmailCommunication';

interface CommDockProps {
  phoneVariant?: 'inbound' | 'outbound';
  emailWrapUp?: boolean;
  linkedTicket?: string;
}

export const CommunicationDock: React.FC<CommDockProps> = ({
  phoneVariant = 'inbound',
  emailWrapUp = false,
  linkedTicket = 'FIN-10482',
}) => {
  const { commMode, setCommMode } = useWorkspace();

  const tabs: { id: CommMode; label: string; icon: any }[] = [
    { id: 'phone', label: 'Phone', icon: Phone },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'email', label: 'Email', icon: Mail },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded p-2 shadow-2xs h-full flex flex-col justify-start select-none overflow-hidden">
      {/* Top Header & Sub-Tabs */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 shrink-0">
        <h3 className="text-[11px] font-bold text-slate-900 tracking-tight">
          Customer Communication
        </h3>

        <div className="flex items-center space-x-2">
          {linkedTicket && (
            <div className="text-[10px] text-slate-500 hidden sm:flex items-center space-x-1">
              <span>Linked ticket:</span>
              <span className="font-bold text-blue-600 font-mono">{linkedTicket}</span>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex items-center space-x-0.5 bg-slate-100 p-0.5 rounded text-[10px] font-medium text-slate-600">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = commMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCommMode(tab.id)}
                  className={`flex items-center space-x-1 px-2.5 py-0.5 rounded transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Mode Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {commMode === 'phone' && <PhoneCommunication variant={phoneVariant} />}
        {commMode === 'chat' && <ChatCommunication />}
        {commMode === 'email' && <EmailCommunication showWrapUp={emailWrapUp} />}
      </div>
    </div>
  );
};
