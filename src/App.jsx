import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, Settings, Plus, Send, Mic, MicOff, Camera, ImagePlus, Globe,
  Wrench, MessageSquare, X, Loader2, AlertCircle, Sparkles, Volume2,
  Square, ExternalLink, Bot, User, Search, AlertTriangle, Trash2, Download
} from 'lucide-react';

const T = {
  ar: {
    appName: 'SAID AI',
    tagline: 'Your Personal Intelligent Assistant.',
    owner: 'Kälte-Klimatechnik Said',
    tabChat: 'المساعد الذكي',
    tabHvac: 'وضع فني التبريد',
    newChat: 'محادثة جديدة',
    webSearch: 'بحث الويب',
    inputPlaceholder: 'اكتب رسالتك أو اسأل عن عطل أو كود خطأ...',
    listening: 'جاري الاستماع... تحدث الآن',
    takePhoto: 'التقاط صورة',
    uploadImage: 'رفع صورة',
    micUnsupported: 'الإدخال الصوتي غير مدعوم في هذا المتصفح.',
    ttsUnsupported: 'النطق الصوتي غير مدعوم في هذا المتصفح.',
    noVoiceWarning: 'لم يتم العثور على صوت عربي في جهازك. فعّل Google TTS من إعدادات Android.',
    thinking: 'جاري التحليل...',
    sources: 'المصادر الموثقة',
    speak: 'استماع',
    stopSpeak: 'إيقاف',
    welcomeTitle: 'مرحباً بك في SAID AI',
    welcomeSubtitle: 'مساعدك الشخصي الذكي للمهام اليومية وتشخيص أنظمة التبريد والتكييف.',
    quickPrompts: [
      'قراءة لوحة بيانات مكيف من صورة',
      'تحليل ضغوط غاز التبريد R32',
      'البحث عن كود خطأ Daikin أو Mitsubishi',
      'تنظيم مهام الصيانة اليومية'
    ],
    hvacTitle: 'تشخيص أعطال التبريد والتكييف',
    hvacSubtitle: 'أدخل القياسات أو أرفق صورة لوحة البيانات',
    safetyNote: 'تنبيه سلامة: افصل الكهرباء وتأكد من انعدام الجهد، وارتدِ معدات الوقاية، وانتبه لقابلية الاشتعال في وسائط A2L/A3 مثل R32 و R290.',
    systemType: 'نوع النظام',
    systemTypes: ['مكيف سبليت', 'VRF / VRV', 'مضخة حرارية (Wärmepumpe)', 'غرفة تبريد (Kühlzelle)', 'شيلر (Chiller)'],
    refrigerant: 'وسيط التبريد',
    brandModel: 'الشركة / الموديل',
    faultCode: 'كود العطل',
    lowPressure: 'الضغط المنخفض LP (bar)',
    highPressure: 'الضغط المرتفع HP (bar)',
    suctionTemp: 'حرارة السحب (°C)',
    dischargeTemp: 'حرارة الطرد (°C)',
    ambientTemp: 'حرارة الجو (°C)',
    symptoms: 'الأعراض والملاحظات',
    symptomsPh: 'مثال: الضاغط يفصل بعد دقيقتين أو وجود ثلج على المبخر...',
    autoWeb: 'تفعيل البحث في الويب عن كتيبات الشركة المصنعة',
    runDiagnosis: 'بدء التحليل الفني',
    savedChats: 'المحادثات المحفوظة',
    noHistory: 'لا توجد محادثات محفوظة.',
    msgs: 'رسالة',
    settingsTitle: 'الإعدادات',
    languageLabel: 'اللغة',
    autoSpeak: 'قراءة الردود صوتياً تلقائياً',
    voiceLabel: 'الصوت المستخدم',
    defaultVoice: 'الصوت الافتراضي للنظام',
    rateLabel: 'سرعة الصوت',
    installApp: 'تثبيت التطبيق على Android',
    installHint: 'للتثبيت يدوياً في Chrome: القائمة (⋮) ثم "الإضافة إلى الشاشة الرئيسية".',
    close: 'إغلاق',
    imgError: 'تعذّر معالجة الصورة.',
    srvError: 'تعذّر الاتصال بالخادم.'
  },
  de: {
    appName: 'SAID AI',
    tagline: 'Your Personal Intelligent Assistant.',
    owner: 'Kälte-Klimatechnik Said',
    tabChat: 'KI-Assistent',
    tabHvac: 'Kältetechnik',
    newChat: 'Neuer Chat',
    webSearch: 'Websuche',
    inputPlaceholder: 'Nachricht eingeben, Störung oder Fehlercode fragen...',
    listening: 'Ich höre zu... Bitte sprechen',
    takePhoto: 'Foto aufnehmen',
    uploadImage: 'Bild hochladen',
    micUnsupported: 'Spracheingabe wird von diesem Browser nicht unterstützt.',
    ttsUnsupported: 'Sprachausgabe wird von diesem Browser nicht unterstützt.',
    noVoiceWarning: 'Keine deutsche TTS-Stimme gefunden. Bitte Google-Sprachausgabe in Android prüfen.',
    thinking: 'Analysiere...',
    sources: 'Quellen & Handbücher',
    speak: 'Vorlesen',
    stopSpeak: 'Stopp',
    welcomeTitle: 'Willkommen bei SAID AI',
    welcomeSubtitle: 'Ihr persönlicher intelligenter Assistent für Alltag & Kälte-Klimatechnik.',
    quickPrompts: [
      'Typenschild per Foto auslesen',
      'Druckwerte für Kältemittel R32 prüfen',
      'Fehlercode-Suche (Daikin / Mitsubishi)',
      'Wartungscheckliste für heute erstellen'
    ],
    hvacTitle: 'HVAC- & Kälte-Diagnose',
    hvacSubtitle: 'Messwerte eingeben oder Foto vom Typenschild anhängen',
    safetyNote: 'Sicherheitshinweis: Spannungsfreiheit prüfen, PSA tragen und auf Brennbarkeit bei A2L/A3-Kältemitteln (R32, R290) achten.',
    systemType: 'Anlagentyp',
    systemTypes: ['Split-Klimagerät', 'VRF / VRV', 'Wärmepumpe', 'Kühlzelle', 'Kaltwassersatz (Chiller)'],
    refrigerant: 'Kältemittel',
    brandModel: 'Hersteller / Modell',
    faultCode: 'Fehlercode',
    lowPressure: 'Niederdruck LP (bar)',
    highPressure: 'Hochdruck HP (bar)',
    suctionTemp: 'Sauggastemp. (°C)',
    dischargeTemp: 'Druckgastemp. (°C)',
    ambientTemp: 'Außentemp. (°C)',
    symptoms: 'Symptome / Hinweise',
    symptomsPh: 'z. B. Verdichter schaltet nach 2 Minuten ab, Verdampfer vereist...',
    autoWeb: 'Websuche für Hersteller-Handbücher aktivieren',
    runDiagnosis: 'Technische Analyse starten',
    savedChats: 'Gespeicherte Chats',
    noHistory: 'Noch keine gespeicherten Chats.',
    msgs: 'Nachrichten',
    settingsTitle: 'Einstellungen',
    languageLabel: 'Sprache',
    autoSpeak: 'Antworten automatisch vorlesen',
    voiceLabel: 'Stimme auswählen',
    defaultVoice: 'Systemstandard',
    rateLabel: 'Sprechgeschwindigkeit',
    installApp: 'Als Android-App installieren',
    installHint: 'Manuell in Chrome: Menü (⋮) → "Zum Startbildschirm zufügen".',
    close: 'Schließen',
    imgError: 'Bild konnte nicht verarbeitet werden.',
    srvError: 'Verbindung zum Server fehlgeschlagen.'
  }
};

const REFRIGERANTS = ['R32', 'R410A', 'R407C', 'R134a', 'R290', 'R448A', 'R449A', 'R744 (CO2)', 'R1234yf', 'Other'];
const CHATS_KEY = 'said_ai_chats_v1';
const SETTINGS_KEY = 'said_ai_settings_v1';

const newConv = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  title: 'SAID AI',
  messages: [],
  updatedAt: Date.now()
});

function compressImage(file, maxDim = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Invalid'));
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const r = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ dataUrl, data: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const savedSet = (() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { return {}; }
  })();

  const [language, setLanguage] = useState(savedSet.language || 'ar');
  const [autoSpeak, setAutoSpeak] = useState(Boolean(savedSet.autoSpeak));
  const [voiceURI, setVoiceURI] = useState(savedSet.voiceURI || '');
  const [speechRate, setSpeechRate] = useState(savedSet.speechRate || 1.0);

  const [conversations, setConversations] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
    return [newConv()];
  });
  const [activeId, setActiveId] = useState(() => conversations[0].id);

  const [tab, setTab] = useState('chat');
  const [inputText, setInputText] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  // HVAC state
  const [sysType, setSysType] = useState(T.ar.systemTypes[0]);
  const [refrigerant, setRefrigerant] = useState('R32');
  const [brandModel, setBrandModel] = useState('');
  const [faultCode, setFaultCode] = useState('');
  const [lp, setLp] = useState('');
  const [hp, setHp] = useState('');
  const [suctionT, setSuctionT] = useState('');
  const [dischargeT, setDischargeT] = useState('');
  const [ambientT, setAmbientT] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [hvacWeb, setHvacWeb] = useState(true);

  // Speech state
  const SpeechRec = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [speakingId, setSpeakingId] = useState(null);
  const [voices, setVoices] = useState([]);

  const recRef = useRef(null);
  const camRef = useRef(null);
  const galRef = useRef(null);
  const endRef = useRef(null);

  const t = T[language] || T.ar;
  const activeConv = conversations.find((c) => c.id === activeId) || conversations[0];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    setSysType((T[language] || T.ar).systemTypes[0]);
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ language, autoSpeak, voiceURI, speechRate }));
    } catch {}
  }, [language, autoSpeak, voiceURI, speechRate]);

  useEffect(() => {
    try {
      localStorage.setItem(CHATS_KEY, JSON.stringify(conversations));
    } catch {
      try {
        const slim = conversations.map((c) => ({
          ...c,
          messages: c.messages.map(({ imagePreview, ...rest }) => rest)
        }));
        localStorage.setItem(CHATS_KEY, JSON.stringify(slim));
      } catch {}
    }
  }, [conversations]);

  useEffect(() => {
    if (!ttsSupported) return;
    const sync = () => setVoices(window.speechSynthesis.getVoices());
    sync();
    window.speechSynthesis.onvoiceschanged = sync;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [ttsSupported]);

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages.length, loading]);

  const speakText = (text, id) => {
    if (!ttsSupported || !text) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/```[\s\S]*?```/g, '').replace(/[#*_`~>\[\]]/g, ' ').replace(/https?:\/\/\S+/g, '').trim();
    if (!clean) return;
    const u = new SpeechSynthesisUtterance(clean);
    const prefix = language === 'ar' ? 'ar' : 'de';
    u.lang = language === 'ar' ? 'ar-SA' : 'de-DE';
    u.rate = speechRate;
    const chosen = voiceURI ? voices.find((v) => v.voiceURI === voiceURI) : voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (chosen) u.voice = chosen;
    u.onstart = () => setSpeakingId(id);
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(u);
  };

  const stopSpeak = () => {
    if (ttsSupported) window.speechSynthesis.cancel();
    setSpeakingId(null);
  };

  const toggleMic = () => {
    if (!SpeechRec) { setErrorMsg(t.micUnsupported); return; }
    if (listening) {
      try { recRef.current?.stop(); } catch {}
      setListening(false);
      setInterim('');
      return;
    }
    stopSpeak();
    setErrorMsg('');
    const r = new SpeechRec();
    r.lang = language === 'ar' ? 'ar-SA' : 'de-DE';
    r.continuous = false;
    r.interimResults = true;
    r.onstart = () => { setListening(true); setInterim(''); };
    r.onresult = (ev) => {
      let inter = '', fin = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const s = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) fin += s; else inter += s;
      }
      setInterim(inter);
      if (fin.trim()) setInputText((p) => (p ? `${p} ${fin.trim()}` : fin.trim()));
    };
    r.onerror = (ev) => {
      setListening(false);
      setInterim('');
      if (ev.error !== 'no-speech' && ev.error !== 'aborted') setErrorMsg(ev.error);
    };
    r.onend = () => { setListening(false); setInterim(''); };
    recRef.current = r;
    r.start();
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorMsg('');
    try {
      setPendingImage(await compressImage(file));
    } catch {
      setErrorMsg(t.imgError);
    }
  };

  const send = async ({ customText = null, modeOverride = null, searchOverride = null } = {}) => {
    const txt = (customText ?? inputText).trim();
    const img = pendingImage;
    if ((!txt && !img) || loading) return;

    const mode = modeOverride || (tab === 'hvac' ? 'hvac' : 'assistant');
    const useSearch = searchOverride ?? webSearch;

    setErrorMsg('');
    setLoading(true);
    if (customText === null) setInputText('');
    setPendingImage(null);
    setTab('chat');

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: txt || (language === 'ar' ? 'يرجى فحص هذه الصورة' : 'Bitte dieses Bild analysieren'),
      imagePreview: img?.dataUrl || null
    };

    const nextMsgs = [...activeConv.messages, userMsg];
    const title = activeConv.messages.length === 0 ? userMsg.text.split('\n')[0].slice(0, 42) : activeConv.title;
    setConversations((prev) => prev.map((c) => (c.id === activeConv.id ? { ...c, title, messages: nextMsgs, updatedAt: Date.now() } : c)));

    try {
      const apiMsgs = nextMsgs.map((m, i) => ({
        role: m.role,
        text: m.text,
        image: i === nextMsgs.length - 1 && img ? { data: img.data, mimeType: img.mimeType } : undefined
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMsgs, language, mode, useWebSearch: useSearch })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.srvError);

      const aiMsg = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.text || '',
        sources: data.sources || [],
        searchEntryPointHtml: data.searchEntryPointHtml || null
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === activeConv.id ? { ...c, messages: [...nextMsgs, aiMsg], updatedAt: Date.now() } : c))
      );

      if (autoSpeak && ttsSupported && aiMsg.text) speakText(aiMsg.text, aiMsg.id);
    } catch (err) {
      setErrorMsg(err.message || t.srvError);
    } finally {
      setLoading(false);
    }
  };

  const submitHvac = (e) => {
    e.preventDefault();
    const lines = language === 'ar'
      ? [
          'طلب تشخيص فني (وضع فني التبريد والتكييف):',
          `- نوع النظام: ${sysType}`,
          `- وسيط التبريد: ${refrigerant}`,
          brandModel ? `- الشركة / الموديل: ${brandModel}` : null,
          faultCode ? `- كود العطل: ${faultCode}` : null,
          lp ? `- الضغط المنخفض (LP): ${lp} bar` : null,
          hp ? `- الضغط المرتفع (HP): ${hp} bar` : null,
          suctionT ? `- حرارة السحب: ${suctionT} °C` : null,
          dischargeT ? `- حرارة الطرد: ${dischargeT} °C` : null,
          ambientT ? `- حرارة الجو: ${ambientT} °C` : null,
          symptoms ? `- الأعراض: ${symptoms}` : null
        ]
      : [
          'Technische Diagnose-Anfrage (Kälte- & Klimatechnik):',
          `- Anlagentyp: ${sysType}`,
          `- Kältemittel: ${refrigerant}`,
          brandModel ? `- Hersteller / Modell: ${brandModel}` : null,
          faultCode ? `- Fehlercode: ${faultCode}` : null,
          lp ? `- Niederdruck (LP): ${lp} bar` : null,
          hp ? `- Hochdruck (HP): ${hp} bar` : null,
          suctionT ? `- Sauggastemp.: ${suctionT} °C` : null,
          dischargeT ? `- Druckgastemp.: ${dischargeT} °C` : null,
          ambientT ? `- Außentemp.: ${ambientT} °C` : null,
          symptoms ? `- Symptome: ${symptoms}` : null
        ];
    send({ customText: lines.filter(Boolean).join('\n'), modeOverride: 'hvac', searchOverride: hvacWeb });
  };

  const langPrefix = language === 'ar' ? 'ar' : 'de';
  const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  const hasVoice = voices.length === 0 || langVoices.length > 0;

  return (
    <div className="app-shell">
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={handleImagePick} className="hidden" />
      <input ref={galRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />

      <header className="header">
        <div className="container">
          <div className="header-top">
            <div className="brand-wrap">
              <button type="button" className="icon-btn" onClick={() => setHistoryOpen(true)} aria-label={t.savedChats}>
                <Menu size={20} />
              </button>
              <div>
                <div className="brand-title">
                  <span>{t.appName}</span>
                  <span className="badge-pro">PRO</span>
                </div>
                <p className="brand-owner">{t.owner}</p>
              </div>
            </div>

            <div className="actions-row">
              <button type="button" className="icon-btn cyan-text" onClick={() => setLanguage((l) => (l === 'ar' ? 'de' : 'ar'))}>
                {language === 'ar' ? 'DE' : 'AR'}
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  const c = newConv();
                  setConversations((p) => [c, ...p]);
                  setActiveId(c.id);
                  setTab('chat');
                }}
                aria-label={t.newChat}
              >
                <Plus size={20} />
              </button>
              <button type="button" className="icon-btn" onClick={() => setSettingsOpen(true)} aria-label={t.settingsTitle}>
                <Settings size={20} />
              </button>
            </div>
          </div>

          <div className="tabs">
            <button type="button" className={`tab-btn ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')}>
              <MessageSquare size={16} />
              <span>{t.tabChat}</span>
            </button>
            <button type="button" className={`tab-btn ${tab === 'hvac' ? 'active' : ''}`} onClick={() => setTab('hvac')}>
              <Wrench size={16} />
              <span>{t.tabHvac}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-area">
        {tab === 'hvac' ? (
          <form className="scroll-area" onSubmit={submitHvac}>
            <div className="hvac-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cyan-light)', fontWeight: 700 }}>
                <Wrench size={18} />
                <span>{t.hvacTitle}</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>{t.hvacSubtitle}</p>
            </div>

            <div className="banner warn">
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{t.safetyNote}</span>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>{t.systemType}</label>
                <select value={sysType} onChange={(e) => setSysType(e.target.value)}>
                  {t.systemTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>{t.refrigerant}</label>
                <select value={refrigerant} onChange={(e) => setRefrigerant(e.target.value)}>
                  {REFRIGERANTS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>{t.brandModel}</label>
                <input value={brandModel} onChange={(e) => setBrandModel(e.target.value)} placeholder="Daikin / Mitsubishi..." />
              </div>
              <div className="field">
                <label>{t.faultCode}</label>
                <input value={faultCode} onChange={(e) => setFaultCode(e.target.value)} placeholder="E4 / U0 / F3..." />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>{t.lowPressure}</label>
                <input type="number" step="0.1" inputMode="decimal" value={lp} onChange={(e) => setLp(e.target.value)} placeholder="0.0" />
              </div>
              <div className="field">
                <label>{t.highPressure}</label>
                <input type="number" step="0.1" inputMode="decimal" value={hp} onChange={(e) => setHp(e.target.value)} placeholder="0.0" />
              </div>
            </div>

            <div className="grid-3">
              <div className="field">
                <label>{t.suctionTemp}</label>
                <input type="number" step="0.1" inputMode="decimal" value={suctionT} onChange={(e) => setSuctionT(e.target.value)} placeholder="°C" />
              </div>
              <div className="field">
                <label>{t.dischargeTemp}</label>
                <input type="number" step="0.1" inputMode="decimal" value={dischargeT} onChange={(e) => setDischargeT(e.target.value)} placeholder="°C" />
              </div>
              <div className="field">
                <label>{t.ambientTemp}</label>
                <input type="number" step="0.1" inputMode="decimal" value={ambientT} onChange={(e) => setAmbientT(e.target.value)} placeholder="°C" />
              </div>
            </div>

            <div className="field">
              <label>{t.symptoms}</label>
              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder={t.symptomsPh} />
            </div>

            <div className="grid-2">
              <button type="button" className="tab-btn" onClick={() => camRef.current?.click()}>
                <Camera size={16} color="#06b6d4" />
                <span>{t.takePhoto}</span>
              </button>
              <button type="button" className="tab-btn" onClick={() => galRef.current?.click()}>
                <ImagePlus size={16} color="#06b6d4" />
                <span>{t.uploadImage}</span>
              </button>
            </div>

            {pendingImage && (
              <div className="preview-wrap">
                <img src={pendingImage.dataUrl} alt="Nameplate" />
                <button type="button" className="remove-img" onClick={() => setPendingImage(null)}><X size={14} /></button>
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: '#cbd5e1', minHeight: 40 }}>
              <input type="checkbox" checked={hvacWeb} onChange={(e) => setHvacWeb(e.target.checked)} style={{ width: 18, height: 18 }} />
              <span>{t.autoWeb}</span>
            </label>

            <button type="submit" className="primary-btn" disabled={loading}>
              <Send size={18} />
              <span>{t.runDiagnosis}</span>
            </button>
          </form>
        ) : (
          <>
            <div className="scroll-area">
              {activeConv.messages.length === 0 ? (
                <div className="welcome-box">
                  <div className="welcome-icon"><Sparkles size={28} /></div>
                  <h1>{t.welcomeTitle}</h1>
                  <p className="tagline">{t.tagline}</p>
                  <p className="subtitle">{t.welcomeSubtitle}</p>
                  <div className="quick-grid">
                    {t.quickPrompts.map((q, i) => (
                      <button key={i} type="button" className="quick-btn" onClick={() => send({ customText: q })}>{q}</button>
                    ))}
                  </div>
                </div>
              ) : (
                activeConv.messages.map((m) => {
                  const isUser = m.role === 'user';
                  const isSpeaking = speakingId === m.id;
                  return (
                    <div key={m.id} className={`msg-row ${isUser ? 'user' : 'model'}`}>
                      <div className="avatar">{isUser ? <User size={16} /> : <Bot size={16} />}</div>
                      <div className="bubble">
                        {m.imagePreview && <img src={m.imagePreview} alt="Upload" className="msg-img" />}
                        <div>{m.text}</div>
                        {!isUser && m.sources?.length > 0 && (
                          <div className="sources-box">
                            <div className="sources-title"><Search size={13} /><span>{t.sources}</span></div>
                            {m.sources.map((s, idx) => (
                              <a key={idx} className="source-link" href={s.uri} target="_blank" rel="noopener noreferrer">
                                <span>{s.title || s.uri}</span>
                                <ExternalLink size={14} style={{ flexShrink: 0 }} />
                              </a>
                            ))}
                          </div>
                        )}
                        {!isUser && m.searchEntryPointHtml && (
                          <div style={{ marginTop: 8, overflowX: 'auto' }} dangerouslySetInnerHTML={{ __html: m.searchEntryPointHtml }} />
                        )}
                        {!isUser && ttsSupported && m.text && (
                          <div className="msg-footer">
                            <button type="button" className="speak-btn" onClick={() => (isSpeaking ? stopSpeak() : speakText(m.text, m.id))}>
                              {isSpeaking ? <><Square size={14} color="#06b6d4" /><span style={{ color: '#67e8f9' }}>{t.stopSpeak}</span></> : <><Volume2 size={14} /><span>{t.speak}</span></>}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cyan-light)', fontSize: '0.88rem' }}>
                  <Loader2 size={16} className="spin" />
                  <span>{t.thinking}</span>
                </div>
              )}

              {errorMsg && (
                <div className="banner error">
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <footer className="composer">
              {pendingImage && (
                <div className="preview-wrap">
                  <img src={pendingImage.dataUrl} alt="Preview" />
                  <button type="button" className="remove-img" onClick={() => setPendingImage(null)}><X size={14} /></button>
                </div>
              )}

              <div className="tools-bar">
                <button type="button" className={`tool-chip ${webSearch ? 'active' : ''}`} onClick={() => setWebSearch((w) => !w)}>
                  <Globe size={14} />
                  <span>{t.webSearch}</span>
                </button>
                <button type="button" className="tool-chip" onClick={() => camRef.current?.click()}>
                  <Camera size={14} color="#06b6d4" />
                  <span>{t.takePhoto}</span>
                </button>
                <button type="button" className="tool-chip" onClick={() => galRef.current?.click()}>
                  <ImagePlus size={14} color="#06b6d4" />
                  <span>{t.uploadImage}</span>
                </button>
              </div>

              <div className="input-row">
                <button type="button" className={`mic-btn ${listening ? 'listening' : ''}`} onClick={toggleMic} aria-label="Mic">
                  {listening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <textarea
                  rows={1}
                  className="text-input"
                  value={listening && interim ? `${inputText} ${interim}`.trim() : inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={listening ? t.listening : t.inputPlaceholder}
                />
                <button type="button" className="send-btn" disabled={loading || (!inputText.trim() && !pendingImage)} onClick={() => send()}>
                  <Send size={20} />
                </button>
              </div>
            </footer>
          </>
        )}
      </main>

      {historyOpen && (
        <div className="overlay">
          <div className="drawer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <strong>{t.savedChats}</strong>
              <button type="button" className="icon-btn" onClick={() => setHistoryOpen(false)}><X size={18} /></button>
            </div>
            <button
              type="button"
              className="primary-btn"
              style={{ marginBottom: 12, minHeight: 44 }}
              onClick={() => {
                const c = newConv();
                setConversations((p) => [c, ...p]);
                setActiveId(c.id);
                setTab('chat');
                setHistoryOpen(false);
              }}
            >
              <Plus size={18} />
              <span>{t.newChat}</span>
            </button>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {conversations.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--muted)' }}>{t.noHistory}</p>
              ) : (
                conversations.map((c) => (
                  <div key={c.id} className={`history-item ${c.id === activeId ? 'active' : ''}`}>
                    <button type="button" className="history-btn" onClick={() => { setActiveId(c.id); setTab('chat'); setHistoryOpen(false); }}>
                      <div className="history-title">{c.title}</div>
                      <div className="history-meta">{c.messages.length} {t.msgs} · {new Date(c.updatedAt).toLocaleDateString()}</div>
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => {
                        setConversations((prev) => {
                          const rem = prev.filter((x) => x.id !== c.id);
                          if (rem.length === 0) { const n = newConv(); setActiveId(n.id); return [n]; }
                          if (c.id === activeId) setActiveId(rem[0].id);
                          return rem;
                        });
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div style={{ flex: 1 }} onClick={() => setHistoryOpen(false)} />
        </div>
      )}

      {settingsOpen && (
        <div className="overlay modal-wrap" onClick={() => setSettingsOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '1.05rem' }}>{t.settingsTitle}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{t.owner}</div>
              </div>
              <button type="button" className="icon-btn" onClick={() => setSettingsOpen(false)}><X size={18} /></button>
            </div>

            <div className="field">
              <label>{t.languageLabel}</label>
              <div className="grid-2">
                <button type="button" className={`tab-btn ${language === 'ar' ? 'active' : ''}`} onClick={() => setLanguage('ar')}>العربية</button>
                <button type="button" className={`tab-btn ${language === 'de' ? 'active' : ''}`} onClick={() => setLanguage('de')}>Deutsch</button>
              </div>
            </div>

            {ttsSupported ? (
              <>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem', borderRadius: 12, background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.88rem' }}>{t.autoSpeak}</span>
                  <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} style={{ width: 20, height: 20 }} />
                </label>

                {!hasVoice && (
                  <div className="banner warn">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{t.noVoiceWarning}</span>
                  </div>
                )}

                <div className="field">
                  <label>{t.voiceLabel}</label>
                  <select value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)}>
                    <option value="">{t.defaultVoice}</option>
                    {(langVoices.length > 0 ? langVoices : voices).map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 4 }}>
                    <span>{t.rateLabel}</span>
                    <span>{speechRate.toFixed(1)}x</span>
                  </div>
                  <input type="range" min="0.7" max="1.4" step="0.1" value={speechRate} onChange={(e) => setSpeechRate(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
              </>
            ) : (
              <div className="banner error">{t.ttsUnsupported}</div>
            )}

            {installPrompt ? (
              <button
                type="button"
                className="primary-btn"
                onClick={async () => {
                  installPrompt.prompt();
                  await installPrompt.userChoice;
                  setInstallPrompt(null);
                }}
              >
                <Download size={18} />
                <span>{t.installApp}</span>
              </button>
            ) : (
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', padding: '0.65rem', borderRadius: 10, background: 'var(--card)' }}>
                {t.installHint}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
      }
