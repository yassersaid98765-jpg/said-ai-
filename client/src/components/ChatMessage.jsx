import React from 'react';
import { Volume2, Square, ExternalLink, Bot, User, Search } from 'lucide-react';

export default function ChatMessage({
  message,
  t,
  isSpeakingThis,
  ttsSupported,
  onSpeak,
  onStopSpeak
}) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
          isUser
            ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
            : 'border-slate-700 bg-card text-cyan-400'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
          isUser
            ? 'border border-cyan-500/30 bg-cyan-600/20 text-slate-100'
            : 'border border-slate-700/80 bg-card text-slate-100'
        }`}
      >
        {message.imagePreview && (
          <img
            src={message.imagePreview}
            alt="Equipment"
            className="mb-2.5 max-h-56 w-auto rounded-xl border border-slate-700 object-contain"
          />
        )}

        <div className="whitespace-pre-wrap break-words">{message.text}</div>

        {!isUser && Array.isArray(message.sources) && message.sources.length > 0 && (
          <div className="mt-3 border-t border-slate-700/70 pt-2.5">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <Search className="h-3.5 w-3.5" />
              <span>{t.sources}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {message.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[40px] items-center justify-between gap-2 rounded-lg bg-slate-900/75 px-3 py-2 text-xs text-cyan-300 active:bg-slate-800"
                >
                  <span className="truncate">{src.title || src.uri}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {!isUser && message.searchEntryPointHtml && (
          <div
            className="mt-2 overflow-x-auto rounded-lg bg-slate-900/60 p-1.5 text-xs"
            dangerouslySetInnerHTML={{ __html: message.searchEntryPointHtml }}
          />
        )}

        {!isUser && ttsSupported && message.text && (
          <div className="mt-2.5 flex items-center justify-end border-t border-slate-700/50 pt-2">
            <button
              type="button"
              onClick={() => (isSpeakingThis ? onStopSpeak() : onSpeak(message.text, message.id))}
              className="flex min-h-[38px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 active:bg-slate-700"
            >
              {isSpeakingThis ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-cyan-400 text-cyan-400" />
                  <span className="text-cyan-400">{t.stopSpeak}</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{t.speak}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
