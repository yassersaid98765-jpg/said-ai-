import React from 'react';
import { X, Trash2, MessageSquare, Plus } from 'lucide-react';

export default function HistoryDrawer({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
  t
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/70 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-sm flex-col border-e border-slate-800 bg-panel shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3.5 pt-safe">
          <h2 className="text-base font-bold text-slate-100">{t.savedChats}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 active:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 font-semibold text-cyan-300 active:bg-cyan-500/25"
          >
            <Plus className="h-5 w-5" />
            <span>{t.newChat}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-2">
          {conversations.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">{t.noHistory}</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${
                  conv.id === activeId
                    ? 'border-cyan-500/50 bg-cyan-500/10'
                    : 'border-slate-800 bg-card/70'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelect(conv.id);
                    onClose();
                  }}
                  className="flex min-w-0 flex-1 items-start gap-2.5 text-start"
                >
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-100">{conv.title}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {conv.messages.length} {t.messagesCount} ·{' '}
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(conv.id)}
                  aria-label={t.deleteChat}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 active:bg-rose-500/15 active:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
