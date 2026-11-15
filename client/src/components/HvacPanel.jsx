import React, { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, Camera, ImagePlus, X, Send } from 'lucide-react';

const REFRIGERANTS = [
  'R32',
  'R410A',
  'R407C',
  'R134a',
  'R290',
  'R448A',
  'R449A',
  'R744 (CO2)',
  'R1234yf',
  'Other'
];

export default function HvacPanel({
  t,
  language,
  onSubmitDiagnosis,
  onPickImage,
  pendingImage,
  onClearImage,
  isLoading
}) {
  const [systemType, setSystemType] = useState(t.systemTypes[0]);
  const [refrigerant, setRefrigerant] = useState('R32');
  const [lowPressure, setLowPressure] = useState('');
  const [highPressure, setHighPressure] = useState('');
  const [suctionTemp, setSuctionTemp] = useState('');
  const [dischargeTemp, setDischargeTemp] = useState('');
  const [ambientTemp, setAmbientTemp] = useState('');
  const [faultCode, setFaultCode] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [autoWebSearch, setAutoWebSearch] = useState(true);

  useEffect(() => {
    setSystemType(t.systemTypes[0]);
  }, [language, t.systemTypes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const lines =
      language === 'ar'
        ? [
            'طلب تشخيص فني (وضع فني التبريد والتكييف):',
            `- نوع النظام: ${systemType}`,
            `- وسيط التبريد: ${refrigerant}`,
            brandModel ? `- الشركة / الموديل: ${brandModel}` : null,
            faultCode ? `- كود العطل: ${faultCode}` : null,
            lowPressure ? `- الضغط المنخفض (LP): ${lowPressure} bar` : null,
            highPressure ? `- الضغط المرتفع (HP): ${highPressure} bar` : null,
            suctionTemp ? `- حرارة خط السحب: ${suctionTemp} °C` : null,
            dischargeTemp ? `- حرارة خط الطرد: ${dischargeTemp} °C` : null,
            ambientTemp ? `- الحرارة الخارجية: ${ambientTemp} °C` : null,
            symptoms ? `- الأعراض والملاحظات: ${symptoms}` : null
          ]
        : [
            'Technische Diagnose-Anfrage (Kälte- & Klimatechnik):',
            `- Anlagentyp: ${systemType}`,
            `- Kältemittel: ${refrigerant}`,
            brandModel ? `- Hersteller / Modell: ${brandModel}` : null,
            faultCode ? `- Fehlercode: ${faultCode}` : null,
            lowPressure ? `- Niederdruck (LP): ${lowPressure} bar` : null,
            highPressure ? `- Hochdruck (HP): ${highPressure} bar` : null,
            suctionTemp ? `- Sauggastemperatur: ${suctionTemp} °C` : null,
            dischargeTemp ? `- Druckgastemperatur: ${dischargeTemp} °C` : null,
            ambientTemp ? `- Außentemperatur: ${ambientTemp} °C` : null,
            symptoms ? `- Symptome / Hinweise: ${symptoms}` : null
          ];

    onSubmitDiagnosis({
      promptText: lines.filter(Boolean).join('\n'),
      enableWebSearch: autoWebSearch
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
      <div className="rounded-2xl border border-cyan-500/30 bg-card p-4">
        <div className="flex items-center gap-2 text-cyan-400">
          <Wrench className="h-5 w-5" />
          <h2 className="text-base font-bold">{t.hvacTitle}</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">{t.hvacSubtitle}</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <span>
          {language === 'ar'
            ? 'تنبيه سلامة: افصل الكهرباء وتأكد من انعدام الجهد، وارتدِ معدات الوقاية، وانتبه لقابلية الاشتعال في وسائط A2L/A3 مثل R32 و R290.'
            : 'Sicherheitshinweis: Spannungsfreiheit prüfen, PSA tragen und auf Brennbarkeit bei A2L/A3-Kältemitteln (R32, R290) achten.'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">{t.systemType}</label>
          <select
            value={systemType}
            onChange={(e) => setSystemType(e.target.value)}
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-panel px-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
          >
            {t.systemTypes.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">{t.refrigerant}</label>
          <select
            value={refrigerant}
            onChange={(e) => setRefrigerant(e.target.value)}
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-panel px-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
          >
            {REFRIGERANTS.map((ref) => (
              <option key={ref} value={ref}>
                {ref}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">{t.brandModel}</label>
          <input
            type="text"
            value={brandModel}
            onChange={(e) => setBrandModel(e.target.value)}
            placeholder="Daikin / Mitsubishi..."
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-panel px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">{t.faultCode}</label>
          <input
            type="text"
            value={faultCode}
            onChange={(e) => setFaultCode(e.target.value)}
            placeholder="E4 / U0 / F3..."
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-panel px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">{t.lowPressure}</label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={lowPressure}
            onChange={(e) => setLowPressure(e.target.value)}
            placeholder="0.0"
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-panel px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">{t.highPressure}</label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={highPressure}
            onChange={(e) => setHighPressure(e.target.value)}
            placeholder="0.0"
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-panel px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-300">{t.suctionTemp}</label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={suctionTemp}
            onChange={(e) => setSuctionTemp(e.target.value)}
            placeholder="°C"
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-panel px-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-300">{t.dischargeTemp}</label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={dischargeTemp}
            onChange={(e) => setDischargeTemp(e.target.value)}
            placeholder="°C"
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-panel px-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-slate-300">{t.ambientTemp}</label>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={ambientTemp}
            onChange={(e) => setAmbientTemp(e.target.value)}
            placeholder="°C"
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-panel px-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-300">{t.symptoms}</label>
        <textarea
          rows={3}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder={t.symptomsPlaceholder}
          className="w-full rounded-xl border border-slate-700 bg-panel p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onPickImage('camera')}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-700 bg-panel px-3 text-sm font-medium text-slate-200 active:bg-slate-800"
          >
            <Camera className="h-4 w-4 text-cyan-400" />
            <span>{t.takePhoto}</span>
          </button>
          <button
            type="button"
            onClick={() => onPickImage('gallery')}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-700 bg-panel px-3 text-sm font-medium text-slate-200 active:bg-slate-800"
          >
            <ImagePlus className="h-4 w-4 text-cyan-400" />
            <span>{t.uploadImage}</span>
          </button>
        </div>

        {pendingImage && (
          <div className="relative inline-block rounded-xl border border-cyan-500/40 bg-panel p-1.5">
            <img src={pendingImage.dataUrl} alt="Preview" className="max-h-28 rounded-lg object-contain" />
            <button
              type="button"
              onClick={onClearImage}
              aria-label={t.removeImage}
              className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl border border-slate-800 bg-panel/60 px-3 py-2 text-xs text-slate-300">
        <input
          type="checkbox"
          checked={autoWebSearch}
          onChange={(e) => setAutoWebSearch(e.target.checked)}
          className="h-4 w-4 accent-cyan-500"
        />
        <span>{t.searchManualAuto}</span>
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        <span>{t.runDiagnosis}</span>
      </button>
    </form>
  );
}
