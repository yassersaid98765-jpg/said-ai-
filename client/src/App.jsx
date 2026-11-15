import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Settings,
  Plus,
  Send,
  Mic,
  MicOff,
  Camera,
  ImagePlus,
  Globe,
  Wrench,
  MessageSquare,
  X,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { translations } from './i18n/translations.js';
import { compressImageFile } from './utils/imageUtils.js';
import { useSpeech } from './hooks/useSpeech.js';
import ChatMessage from './components/ChatMessage.jsx';
import HvacPanel from './components/HvacPanel.jsx';
import HistoryDrawer from './components/HistoryDrawer.jsx';
import SettingsModal from './components/SettingsModal.jsx';

const STORAGE_CHATS_KEY = 'said_ai_conversations_v1';
const STORAGE_SETTINGS_KEY = 'said_ai_settings_v1';

function createConversation() {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: 'SAID AI',
    messages: [],
    updatedAt: Date.now()
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore storage read error
  }
  return { language: 'ar', autoSpeak: false, selectedVoiceURI: '', speechRate: 1.0 };
}

function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_CHATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage read error
  }
  return [createConversation()];
}

export default function App() {
  const initialSettings = loadSettings();
  const [language, setLanguage] = useState(initialSettings.language || 'ar');
  const [autoSpeak, setAutoSpeak] = useState(Boolean(initialSettings.autoSpeak));
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(initialSettings.selectedVoiceURI || '');
  const [speechRate, setSpeechRate] = useState(initialSettings.speechRate || 1.0);

  const [conversations, setConversations] = useState(loadConversations);
  const [activeConvId, setActiveConvId] = useState(() => conversations[0].id);

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'hvac'
  const [inputText, setInputText] = useState('');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const t = translations[language] || translations.ar;
  const activeConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  const speech = useSpeech({ language, selectedVoiceURI, speechRate });

  // Sync HTML dir/lang for Arabic RTL and German LTR
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_SETTINGS_KEY,
        JSON.stringify({ language, autoSpeak, selectedVoiceURI, speechRate })
      );
    } catch {
      // ignore quota errors
    }
  }, [language, autoSpeak, selectedVoiceURI, speechRate]);

  // Persist conversations safely (strip heavy base64 previews if storage quota is tight)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(conversations));
    } catch {
      try {
        const lightweight = conversations.map((c) => ({
          ...c,
          messages: c.messages.map(({ imagePreview, ...rest }) => rest)
        }));
        localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(lightweight));
      } catch {
        // ignore if localStorage is completely full
      }
    }
  }, [conversations]);

  // Capture Android Chrome PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages.length, isLoading]);

  const handleInstallPwa = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
  };

  const handleNewChat = () => {
    const fresh = createConversation();
    setConversations((prev) => [fresh, ...prev]);
    setActiveConvId(fresh.id);
    setActiveTab('chat');
    setErrorMsg('');
  };

  const handleDeleteChat = (id) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fresh = createConversation();
        setActiveConvId(fresh.id);
        return [fresh];
      }
      if (id === activeConvId) {
        setActiveConvId(remaining[0].id);
      }
      return remaining;
    });
  };

  const triggerImagePick = (source) => {
    if (source === 'camera') {
      cameraInputRef.current?.click();
    } else {
      galleryInputRef.current?.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorMsg('');
    try {
      const compressed = await compressImageFile(file);
      setPendingImage(compressed);
    } catch {
      setErrorMsg(t.imageError);
    }
  };

  const sendMessage = async ({
    customText = null,
    modeOverride = null,
    webSearchOverride = null
  } = {}) => {
    const textToSend = (customText ?? inputText).trim();
    const imageToSend = pendingImage;

    if (!textToSend && !imageToSend) return;
    if (isLoading) return;

    const effectiveMode = modeOverride || (activeTab === 'hvac' ? 'hvac' : 'assistant');
    const effectiveSearch = webSearchOverride ?? useWebSearch;

    setErrorMsg('');
    setIsLoading(true);
    if (customText === null) setInputText('');
    setPendingImage(null);
    setActiveTab('chat');

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend || (language === 'ar' ? 'يرجى فحص هذه الصورة' : 'Bitte dieses Bild analysieren'),
      imagePreview: imageToSend?.dataUrl || null
    };

    const currentHistory = activeConversation.messages;
    const updatedMessages = [...currentHistory, userMsg];

    const newTitle =
      currentHistory.length === 0
        ? userMsg.text.split('\n')[0].slice(0, 42)
        : activeConversation.title;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, title: newTitle, messages: updatedMessages, updatedAt: Date.now() }
          : c
      )
    );

    try {
      const apiMessages = updatedMessages.map((m, idx) => {
        const isCurrentTurn = idx === updatedMessages.length - 1;
        return {
          role: m.role,
          text: m.text,
          image:
            isCurrentTurn && imageToSend
              ? { data: imageToSend.data, mimeType: imageToSend.mimeType }
              : undefined
        };
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          language,
          mode: effectiveMode,
          useWebSearch: effectiveSearch
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.serverError);
      }

      const aiMsg = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.text || '',
        sources: data.sources || [],
        searchEntryPointHtml: data.searchEntryPointHtml || null
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, messages: [...updatedMessages, aiMsg], updatedAt: Date.now() }
            : c
        )
      );

      if (autoSpeak && speech.ttsSupported && aiMsg.text) {
        speech.speak(aiMsg.text, aiMsg.id);
      }
    } catch (err) {
      setErrorMsg(err.message || t.serverError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicToggle = () => {
    if (!speech.sttSupported) {
      setErrorMsg(t.micUnsupported);
      return;
    }
    if (speech.isListening) {
      speech.stopListening();
    } else {
      speech.startListening((finalTranscript) => {
        setInputText((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
      });
    }
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-obsidian text-slate-100">
      {/* Hidden native inputs for Samsung Android camera & gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Top Header */}
      <header className="shrink-0 border-b border-slate-800/90 bg-panel/95 px-3 py-2.5 pt-safe backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              aria-label={t.history}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-card text-slate-200 active:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-cyan-400">
                  {t.appName}
                </span>
                <span className="rounded-md bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">{t.owner}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLanguage((l) => (l === 'ar' ? 'de' : 'ar'))}
              className="flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-card px-3 text-xs font-bold text-cyan-300 active:bg-slate-800"
            >
              {language === 'ar' ? 'DE' : 'AR'}
            </button>
            <button
              type="button"
              onClick={handleNewChat}
              aria-label={t.newChat}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-card text-slate-200 active:bg-slate-800"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label={t.settings}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-card text-slate-200 active:bg-slate-800"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="mx-auto mt-2.5 grid max-w-3xl grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
              activeTab === 'chat'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-card text-slate-300 border border-slate-800'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{t.tabChat}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hvac')}
            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
              activeTab === 'hvac'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-card text-slate-300 border border-slate-800'
            }`}
          >
            <Wrench className="h-4 w-4" />
            <span>{t.tabHvac}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden">
        {activeTab === 'hvac' ? (
          <HvacPanel
            t={t}
            language={language}
            pendingImage={pendingImage}
            onClearImage={() => setPendingImage(null)}
            onPickImage={triggerImagePick}
            isLoading={isLoading}
            onSubmitDiagnosis={({ promptText, enableWebSearch }) =>
              sendMessage({
                customText: promptText,
                modeOverride: 'hvac',
                webSearchOverride: enableWebSearch
              })
            }
          />
        ) : (
          <>
            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {activeConversation.messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center px-2">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-100">{t.welcomeTitle}</h1>
                  <p className="mt-1 text-xs font-medium text-cyan-400">{t.tagline}</p>
                  <p className="mt-2 max-w-sm text-sm text-slate-400">{t.welcomeSubtitle}</p>

                  <div className="mt-6 grid w-full max-w-md grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {t.quickPrompts.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => sendMessage({ customText: q })}
                        className="min-h-[48px] rounded-xl border border-slate-800 bg-card px-3.5 py-2.5 text-start text-xs font-medium text-slate-200 active:border-cyan-500/50 active:bg-slate-800"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                activeConversation.messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    t={t}
                    ttsSupported={speech.ttsSupported}
                    isSpeakingThis={speech.isSpeaking && speech.speakingMessageId === msg.id}
                    onSpeak={speech.speak}
                    onStopSpeak={speech.stopSpeaking}
                  />
                ))
              )}

              {isLoading && (
                <div className="flex items-center gap-2.5 text-sm text-cyan-400 px-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.thinking}</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Composer */}
            <footer className="shrink-0 border-t border-slate-800/90 bg-panel/95 px-3 pt-2.5 pb-safe">
              {pendingImage && (
                <div className="mb-2 flex items-center gap-2">
                  <div className="relative inline-block rounded-xl border border-cyan-500/40 bg-card p-1">
                    <img
                      src={pendingImage.dataUrl}
                      alt="Attachment"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPendingImage(null)}
                      aria-label={t.removeImage}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Touch-friendly utility row */}
              <div className="mb-2 flex items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setUseWebSearch((w) => !w)}
                  className={`flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${
                    useWebSearch
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                      : 'border-slate-700 bg-card text-slate-300'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{t.webSearch}</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerImagePick('camera')}
                  className="flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl border border-slate-700 bg-card px-3 text-xs font-medium text-slate-200 active:bg-slate-800"
                >
                  <Camera className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{t.takePhoto}</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerImagePick('gallery')}
                  className="flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl border border-slate-700 bg-card px-3 text-xs font-medium text-slate-200 active:bg-slate-800"
                >
                  <ImagePlus className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{t.uploadImage}</span>
                </button>
              </div>

              {/* Input + Mic + Send */}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleMicToggle}
                  aria-label="Microphone"
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition ${
                    speech.isListening
                      ? 'border-rose-500 bg-rose-500/20 text-rose-400 animate-pulse'
                      : 'border-slate-700 bg-card text-slate-200 active:bg-slate-800'
                  }`}
                >
                  {speech.isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>

                <textarea
                  rows={1}
                  value={
                    speech.isListening && speech.interimTranscript
                      ? `${inputText} ${speech.interimTranscript}`.trim()
                      : inputText
                  }
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={speech.isListening ? t.listeningPlaceholder : t.inputPlaceholder}
                  className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-slate-700 bg-card px-3.5 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                />

                <button
                  type="button"
                  disabled={isLoading || (!inputText.trim() && !pendingImage)}
                  onClick={() => sendMessage()}
                  aria-label={t.send}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-40"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </footer>
          </>
        )}
      </main>

      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversations}
        activeId={activeConversation.id}
        onSelect={(id) => {
          setActiveConvId(id);
          setActiveTab('chat');
        }}
        onDelete={handleDeleteChat}
        onNewChat={handleNewChat}
        t={t}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        language={language}
        onChangeLanguage={setLanguage}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={setAutoSpeak}
        selectedVoiceURI={selectedVoiceURI}
        onChangeVoice={setSelectedVoiceURI}
        speechRate={speechRate}
        onChangeSpeechRate={setSpeechRate}
        speech={speech}
        canInstallPwa={Boolean(deferredInstallPrompt)}
        onInstallPwa={handleInstallPwa}
        t={t}
      />
    </div>
  );
}
