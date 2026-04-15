import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, Leaf, ShieldAlert, Sparkles, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'agrismart_gemini_key';

export default function DiseaseScanner() {
  const { user } = useAuth();
  const [imageSrc, setImageSrc] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [keyPrompt, setKeyPrompt] = useState(!apiKey);
  const [keyInput, setKeyInput] = useState('');

  const saveKey = () => {
    if (!keyInput.trim()) return;
    localStorage.setItem(STORAGE_KEY, keyInput.trim());
    setApiKey(keyInput.trim());
    setKeyPrompt(false);
  };

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImageSrc(e.target.result);
      reader.readAsDataURL(file);
      // Reset previous results
      setResult(null);
      setError('');
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) return;
    if (!apiKey) {
      setKeyPrompt(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Convert Image to Base64 (strip the Data URL prefix)
      const base64Data = imageSrc.split(',')[1];
      const mimeType = imageFile.type;

      // 2. Build Gemini Vision Payload
      const prompt = `You are an expert botanist and agricultural scientist. Analyze this plant leaf image. 
      Please provide a structured report using EXACTLY this format:
      
      **Diagnosis:** [Name of disease or "Healthy"]
      **Severity:** [Low / Moderate / High]
      **Symptoms:** [Brief description of what you see]
      **Treatment (Chemical):** [Recommended pesticides or actions]
      **Treatment (Organic):** [Recommended organic solutions]
      
      Keep it brief and actionable for a farmer. If it's not a plant, gently say so.`;

      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Data } }
            ]
          }
        ],
        generationConfig: { temperature: 0.4, maxOutputTokens: 600 }
      };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || 'Failed to analyze image');
      }

      const data = await res.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) throw new Error("Empty response from AI");
      
      setResult(textResponse);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while analyzing.');
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown parser for the result
  const renderResult = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.includes('**')) {
        const parts = line.split('**');
        return <p key={i} style={{ marginBottom: '0.5rem', lineHeight: 1.5 }}><strong>{parts[1]}</strong>{parts.slice(2).join('')}</p>;
      }
      return line.trim() ? <p key={i} style={{ marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>{line}</p> : null;
    });
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-title">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Leaf className="text-success" /> AI Disease Scanner
          </h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Take a photo of a sick plant to instantly identify the disease.
          </p>
        </div>
        {apiKey && (
          <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setKeyPrompt(!keyPrompt)}>
            <Key size={14} /> Update API Key
          </button>
        )}
      </div>

      {keyPrompt && (
        <div style={{ background: 'var(--color-bg-base)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
            <Key size={20} /> Gemini API Key Required
          </h3>
          <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Because this tool uses advanced Computer Vision, you must provide your free Gemini API key to proceed.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Paste your Gemini API key here..." 
              value={keyInput} 
              onChange={e => setKeyInput(e.target.value)} 
              style={{ flex: 1, minWidth: '250px' }}
            />
            <button className="btn btn-primary" onClick={saveKey}>Save Key</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Camera / Upload */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', borderStyle: imageSrc ? 'solid' : 'dashed', borderWidth: '2px', background: imageSrc ? 'transparent' : 'var(--color-bg-base)' }}>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
          />

          {imageSrc ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={imageSrc} alt="Scanned plant" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: 'var(--radius-md)', objectFit: 'contain' }} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleCaptureClick} disabled={loading}>
                  Retake Photo
                </button>
                <button className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center' }} onClick={analyzeImage} disabled={loading}>
                  {loading ? <span className="spinner" style={{ borderTopColor: 'white' }}></span> : <><Sparkles size={18} /> Analyze Now</>}
                </button>
              </div>
            </div>
          ) : (
             <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <Camera size={40} />
                </div>
                <h3>Scan a Sick Crop</h3>
                <p className="text-muted" style={{ margin: '1rem 0 2rem 0', maxWidth: '300px' }}>
                  Tap below to open your camera. Make sure the diseased leaf is clearly visible in good lighting.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={handleCaptureClick} style={{ minWidth: '180px', fontSize: '1.1rem' }}>
                    <Camera size={20} /> Open Camera
                  </button>
                </div>
             </div>
          )}
        </div>

        {/* Right Column: AI Results */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {loading ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-primary)', opacity: 0.8 }}>
               <Sparkles size={48} className="animate-pulse" style={{ marginBottom: '1rem' }} />
               <h3>AI is analyzing your crop...</h3>
               <p className="text-muted mt-2 text-sm">Identifying diseases and finding treatments.</p>
             </div>
          ) : result ? (
             <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <ShieldAlert size={28} className="text-danger" />
                  <h2 style={{ color: 'var(--color-text-main)' }}>Diagnosis Complete</h2>
                </div>
                <div style={{ background: 'var(--color-bg-base)', padding: '1.5rem', borderRadius: 'var(--radius-md)', fontSize: '1.05rem' }}>
                  {renderResult(result)}
                </div>
                <button className="btn btn-outline w-full" style={{ marginTop: '1.5rem' }} onClick={() => window.print()}>
                  Export Report Card
                </button>
             </div>
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <AlertCircle size={48} className="text-danger" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--color-danger)' }}>Analysis Failed</h3>
              <p className="text-muted" style={{ marginTop: '0.5rem', maxWidth: '300px' }}>{error}</p>
            </div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>
               <ShieldAlert size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
               <h3>No Results Yet</h3>
               <p style={{ marginTop: '0.5rem', maxWidth: '250px', fontSize: '0.9rem' }}>
                 Take a clear photo of the top and bottom of a sick leaf and click 'Analyze' to view the AI diagnosis here.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
