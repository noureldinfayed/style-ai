'use client'

import { useState, useRef, useCallback } from 'react'

type Lang = 'en' | 'ar'
type Modesty = 'modest' | 'balanced' | 'free'

interface Outfit {
  name: string
  items: string[]
  tip: string
}

const BG_URL = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80'

const EN_OCCASIONS = ['Work', 'Wedding', 'Eid', 'Ramadan', 'North Coast', 'Casual', 'Date Night']
const AR_OCCASIONS = ['عمل', 'فرح', 'عيد', 'رمضان', 'الساحل الشمالي', 'يومي', 'سهرة']
const EMOJIS = ['✨', '💎', '🌟']
const AR_NUMS = ['١', '٢', '٣']

const EXAMPLE_CARDS: Record<Lang, Outfit[]> = {
  en: [
    {
      name: 'Office Power Look 💼',
      items: ['White linen blazer', 'High-waist beige trousers', 'Nude pointed heels', 'Gold minimal necklace', 'Brown leather tote'],
      tip: 'Keep accessories minimal — let the blazer do the talking',
    },
    {
      name: 'Weekend Elegance 🌿',
      items: ['Oversized crisp white shirt', 'Wide-leg olive trousers', 'White leather sneakers', 'Delicate gold hoops', 'Beige crossbody bag'],
      tip: 'Half-tuck the shirt for a relaxed polished finish',
    },
    {
      name: 'Evening Ready ✨',
      items: ['Ivory silk camisole', 'Black wide-leg trousers', 'Strappy block heels', 'Statement gold earrings', 'Black satin clutch'],
      tip: 'A bold lip and this outfit speaks for itself',
    },
  ],
  ar: [
    {
      name: 'إطلالة المكتب 💼',
      items: ['بليزر كتان أبيض', 'بنطلون بيج عالي الخصر', 'كعب نود مدبب', 'قلادة ذهبية بسيطة', 'حقيبة جلدية بنية'],
      tip: 'حافظي على إكسسواراتك بسيطة ودعي البليزر يتحدث',
    },
    {
      name: 'أناقة يومية 🌿',
      items: ['قميص أبيض أوفرسايز', 'بنطلون زيتي واسع', 'سنيكرز جلد أبيض', 'حلقات ذهبية رفيعة', 'شنطة كروس بودي بيج'],
      tip: 'اطوي طرف القميص للأمام لإطلالة مريحة وأنيقة',
    },
    {
      name: 'جاهزة للسهرة ✨',
      items: ['كامي ساتان عاجي', 'بنطلون أسود واسع', 'صندل بكعب مربع', 'أقراط ذهبية كبيرة', 'كلاتش ساتان أسود'],
      tip: 'أضيفي أحمر شفاه جريء وستكتمل الإطلالة',
    },
  ],
}

const STRINGS = {
  en: {
    logo: 'StyleAI',
    toggle: 'ع',
    modest: 'Modest',
    balanced: 'Balanced',
    free: 'Free',
    uploadTitle: 'Drop your clothing item here',
    uploadSub: 'JPG · PNG · WEBP',
    changePhoto: 'Tap to change photo',
    occasions: EN_OCCASIONS,
    cta: 'Get Styled ✦',
    loading: 'Styling your look…',
    resultsTitle: 'Your Personalized Outfits',
    exampleLabel: '✨ Example Styling — Upload your item for personalized results',
    outfitLabel: 'Outfit',
    tipLabel: 'Tip',
    noImage: 'Please upload a photo first',
    apiError: 'Something went wrong. Please try again.',
  },
  ar: {
    logo: 'StyleAI',
    toggle: 'EN',
    modest: 'محتشم',
    balanced: 'معتدل',
    free: 'حر',
    uploadTitle: 'ارفع قطعة ملابسك هنا',
    uploadSub: 'JPG · PNG · WEBP',
    changePhoto: 'اضغط لتغيير الصورة',
    occasions: AR_OCCASIONS,
    cta: 'احصل على إطلالتك ✦',
    loading: 'جاري تصميم إطلالتك…',
    resultsTitle: 'إطلالاتك المخصصة',
    exampleLabel: '✨ مثال على التنسيق — ارفع قطعتك للحصول على نتائج مخصصة',
    outfitLabel: 'إطلالة',
    tipLabel: 'نصيحة',
    noImage: 'من فضلك ارفع صورة أولاً',
    apiError: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
  },
}

const G: React.CSSProperties = {
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
}

function glass(alpha = 0.45, blur = 12): React.CSSProperties {
  return {
    background: `rgba(0,0,0,${alpha})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
  }
}

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const [modesty, setModesty] = useState<Modesty>('balanced')
  const [occasionIdx, setOccasionIdx] = useState(5)
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Outfit[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const tr = STRINGS[lang]
  const isRTL = lang === 'ar'

  function handleFile(file: File) {
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
      setResults(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  async function handleSubmit() {
    if (!image) {
      triggerShake()
      setError(tr.noImage)
      return
    }
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const res = await fetch('/api/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, modesty, occasion: EN_OCCASIONS[occasionIdx], language: lang }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error)
      setResults(data.outfits)
    } catch {
      setError(tr.apiError)
    } finally {
      setLoading(false)
    }
  }

  const modestyOptions: { key: Modesty; label: string }[] = [
    { key: 'modest', label: tr.modest },
    { key: 'balanced', label: tr.balanced },
    { key: 'free', label: tr.free },
  ]

  return (
    <>
      {/* ── Fixed cinematic background ── */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url('${BG_URL}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />
      <div
        aria-hidden
        style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.55)' }}
      />

      {/* ── Scrollable content ── */}
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          fontFamily: 'var(--font-body, system-ui, sans-serif)',
        }}
      >

        {/* App container — 480px */}
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* ── Header ── */}
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '3px', textTransform: 'uppercase', lineHeight: 1 }}>
              {tr.logo}
            </h1>
            <button
              onClick={() => { setLang(l => l === 'en' ? 'ar' : 'en'); setResults(null); setError(null) }}
              style={{
                padding: '7px 18px', borderRadius: 999,
                border: '1.5px solid rgba(255,255,255,0.35)',
                ...glass(0.25, 10),
                color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff' }}
            >
              {tr.toggle}
            </button>
          </header>

          {/* ── Modesty pills ── */}
          <div style={{ display: 'flex', gap: 8 }}>
            {modestyOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setModesty(key)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 999,
                  border: `1.5px solid ${modesty === key ? '#C9A84C' : 'rgba(255,255,255,0.2)'}`,
                  ...glass(modesty === key ? 0.55 : 0.2, 10),
                  color: modesty === key ? '#C9A84C' : 'rgba(255,255,255,0.75)',
                  fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Upload zone ── */}
          <div
            className={shake ? 'shake' : ''}
            onClick={() => fileRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={() => setDragOver(false)}
            style={{
              borderRadius: 20,
              border: `2px dashed ${dragOver ? '#C9A84C' : 'rgba(255,255,255,0.3)'}`,
              ...glass(dragOver ? 0.2 : 0.08, 8),
              cursor: 'pointer', transition: 'all 0.15s', minHeight: 190,
            }}
          >
            {image ? (
              <div style={{ position: 'relative' }}>
                <div style={{ height: 270, borderRadius: 18, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={image} alt="Uploaded clothing item" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 10 }} />
                </div>
                <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', ...glass(0.7, 10), border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, padding: '5px 16px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                  {tr.changePhoto}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '48px 24px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.3)', ...glass(0.2, 8), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UploadIcon />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>{tr.uploadTitle}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 5, fontWeight: 500 }}>{tr.uploadSub}</p>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {/* ── Occasion pills ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tr.occasions.map((occ, i) => (
              <button
                key={i}
                onClick={() => setOccasionIdx(i)}
                style={{
                  padding: '8px 16px', borderRadius: 999,
                  border: `1.5px solid ${occasionIdx === i ? '#C9A84C' : 'rgba(255,255,255,0.2)'}`,
                  ...glass(occasionIdx === i ? 0.5 : 0.18, 8),
                  color: occasionIdx === i ? '#C9A84C' : 'rgba(255,255,255,0.75)',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                {occ}
              </button>
            ))}
          </div>

          {/* ── CTA button ── */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '17px', borderRadius: 16, border: 'none',
              background: loading ? 'rgba(232,72,107,0.4)' : 'linear-gradient(135deg, #E8486B 0%, #FF8C42 100%)',
              color: '#fff', fontSize: 17, fontWeight: 800, letterSpacing: '0.3px',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: loading ? 'none' : '0 6px 28px rgba(232,72,107,0.5)',
              transition: 'all 0.15s',
            }}
          >
            {loading ? <><SpinnerIcon />{tr.loading}</> : tr.cta}
          </button>

          {/* ── Error ── */}
          {error && <p style={{ textAlign: 'center', color: '#FF7A9A', fontSize: 14, fontWeight: 600 }}>{error}</p>}

          {/* ── API personalized results ── */}
          {results && results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '0.3px' }}>{tr.resultsTitle}</h2>
              {results.map((outfit, i) => (
                <OutfitCard
                  key={i} outfit={outfit} index={i} isRTL={isRTL}
                  outfitLabel={tr.outfitLabel} tipLabel={tr.tipLabel}
                  numLabel={isRTL ? AR_NUMS[i] : String(i + 1)} emoji={EMOJIS[i]}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 18px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.3px' }}>
            {isRTL ? 'إثبات مفهوم · من تصميم وهندسة ' : 'Proof of Concept · Engineered & Architected by '}
            <a
              href="https://fayedintelligence.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 700 }}
            >
              Fayed Intelligence
            </a>
          </p>
        </div>

        {/* ── Example cards section — breaks wider on desktop ── */}
        <div style={{ padding: '4px 18px 60px' }}>

          {/* Label aligned to 480px */}
          <div style={{ maxWidth: 480, margin: '0 auto 14px' }}>
            <p style={{
              color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.3px', textAlign: 'center',
            }}>
              {tr.exampleLabel}
            </p>
          </div>

          {/* 3-col grid — auto-fit collapses to 1 col on narrow screens */}
          <div style={{
            maxWidth: 960, margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {EXAMPLE_CARDS[lang].map((card, i) => (
              <OutfitCard
                key={i} outfit={card} index={i} isRTL={isRTL}
                outfitLabel={tr.outfitLabel} tipLabel={tr.tipLabel}
                numLabel={isRTL ? AR_NUMS[i] : String(i + 1)} emoji={EMOJIS[i]}
              />
            ))}
          </div>
        </div>

      </div>
    </>
  )
}

// ── Shared outfit card ──────────────────────────────────────────────────────

function OutfitCard({
  outfit, index, isRTL, outfitLabel, tipLabel, numLabel, emoji,
}: {
  outfit: Outfit; index: number; isRTL: boolean
  outfitLabel: string; tipLabel: string; numLabel: string; emoji: string
}) {
  const gold = '#C9A84C'
  const goldFaint = 'rgba(201,168,76,0.12)'

  return (
    <div style={{
      borderRadius: 16,
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderTop: `2px solid ${gold}`,
      display: 'flex', flexDirection: 'column', gap: 14,
      overflow: 'hidden',
    }}>
      {/* Header — dir="rtl" from parent handles visual order, never override flexDirection */}
      <div style={{ padding: '16px 18px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: goldFaint, border: `1px solid rgba(201,168,76,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {emoji}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
            {outfitLabel} {numLabel}
          </p>
          <p style={{ fontSize: 15, fontWeight: 800, color: gold, marginTop: 1, lineHeight: 1.3 }}>
            {outfit.name}
          </p>
        </div>
      </div>

      {/* Items — flex row with dir="rtl" parent: bullet naturally appears on the right in Arabic */}
      <ul style={{ padding: '0 18px', margin: 0, display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none' }}>
        {outfit.items.map((item, j) => (
          <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: gold, marginTop: 6, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', fontWeight: 500, lineHeight: 1.5 }}>{item}</span>
          </li>
        ))}
      </ul>

      {/* Tip */}
      <div style={{ margin: '0 14px 16px', padding: '10px 12px', borderRadius: 10, background: goldFaint, border: `1px solid rgba(201,168,76,0.2)`, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: gold, textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0, paddingTop: 2 }}>{tipLabel}:</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontWeight: 500 }}>{outfit.tip}</span>
      </div>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
      <path d="M4 12a8 8 0 018-8" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
