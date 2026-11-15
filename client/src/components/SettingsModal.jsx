import React from 'react';
import { X, Download, Volume2, AlertCircle } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  language,
  onChangeLanguage,
  autoSpeak,
  onToggleAutoSpeak,
  selectedVoiceURI,
  onChangeVoice,
  speechRate,
  onChangeSpeechRate,
  speech,
  canInstallPwa,
  onInstallPwa,
  t
}) {
  if (!isOpen) return null;

  const prefix = language === 'ar' ? 'ar' : 'de';
  const matchingVoices = speech.voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  const voiceOptions = matchingVoices.length > 0 ? matchingVoices : speech.voices;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl border border-slate-800 bg-panel p-5 pb-safe shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{t.settingsTitle}</h2>
            <p className="text-xs text-slate-400">{t.owner}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 active:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Language */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              {t.languageLabel}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onChangeLanguage('ar')}
                className={`min-h-[48px] rounded-xl border text-sm font-semibold ${
                  language === 'ar'
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                    : 'border-slate-700 bg-card text-slate-300'
                }`}
              >
                العربية (افتراضي)
              </button>
              <button
                type="button"
                onClick={() => onChangeLanguage('de')}
                className={`min-h-[48px] rounded-xl border text-sm font-semibold ${
                  language === 'de'
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                    : 'border-slate-700 bg-card text-slate-300'
                }`}
              >
                Deutsch
              </button>
            </div>
          </div>

          {/* Voice Settings */}
          {speech.ttsSupported ? (
            <>
              <label className="flex min-h-[48px] cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-card px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-sm text-slate-200">
                  <Volume2 className="h-4 w-4 text-cyan-400" />
                  {t.autoSpeakLabel}
                </span>
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(e) => onToggleAutoSpeak(e.target.checked)}
                  className="h-5 w-5 accent-cyan-500"
                />
              </label>

              {!speech.hasCurrentLangVoice && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span>{t.noVoiceWarning}</span>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  {t.voiceLabel}
                </label>
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => onChangeVoice(e.target.value)}
                  className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-card px-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">{t.defaultVoice}</option>
                  {voiceOptions.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-xs text-slate-300">
                  <span>{t.speechRateLabel}</span>
                  <span>{speechRate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => onChangeSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-card p-3 text-xs text-slate-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{t.ttsUnsupported}</span>
            </div>
          )}

          {/* Android PWA Install */}
          {canInstallPwa ? (
            <button
              type="button"
              onClick={onInstallPwa}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 font-bold text-slate-950 active:scale-[0.99]"
            >
              <Download className="h-4 w-4" />
              <span>{t.installApp}</span>
            </button>
          ) : (
            <p className="rounded-xl border border-slate-800 bg-card/60 p-3 text-xs text-slate-400">
              {t.installHint}
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-card text-sm font-semibold text-slate-200 active:bg-slate-800"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
