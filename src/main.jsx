import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const EXERCISE_TYPES = [
  ['qcm', 'QCM'],
  ['translation', 'Traduction'],
  ['ordering', 'Mots mélangés'],
  ['fill', 'Phrase à compléter'],
  ['listening', 'Compréhension'],
  ['dialogue', 'Dialogue vocal']
];

const LESSONS = [
  { es: 'Hola, ¿cómo está?', fr: 'Bonjour, comment allez-vous ?', answer: 'Muy bien, gracias.' },
  { es: '¿Cómo se llama?', fr: 'Comment vous appelez-vous ?', answer: 'Me llamo Patricia.' },
  { es: '¿Dónde está el supermercado?', fr: 'Où est le supermarché ?', answer: 'Está cerca de aquí.' },
  { es: '¿Cuánto cuesta?', fr: 'Combien cela coûte ?', answer: 'Cuesta cinco euros.' },
  { es: '¿Puede ayudarme?', fr: 'Pouvez-vous m’aider ?', answer: 'Sí, claro.' },
  { es: '¿Dónde está el baño?', fr: 'Où sont les toilettes ?', answer: 'El baño está allí.' }
];

const norm = (s = '') => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zñ0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const scoreText = (a, b) => {
  const aa = new Set(norm(a).split(' ').filter(Boolean));
  const bb = new Set(norm(b).split(' ').filter(Boolean));
  if (!aa.size || !bb.size) return 0;
  let common = 0;
  aa.forEach((w) => { if (bb.has(w)) common += 1; });
  return Math.round((2 * common / (aa.size + bb.size)) * 100);
};

function speak(text, rate = 0.85) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES'; u.rate = rate;
  window.speechSynthesis.speak(u);
}

function App() {
  const [profile, setProfile] = useState(() => localStorage.getItem('me-profile') || '');
  const [type, setType] = useState('qcm');
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [voiceStatus, setVoiceStatus] = useState('Prêt');
  const [recording, setRecording] = useState(false);
  const [azureReady, setAzureReady] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const lesson = LESSONS[index];

  useEffect(() => { if (profile) localStorage.setItem('me-profile', profile); }, [profile]);

  useEffect(() => {
    fetch('/api/speech-token')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setAzureReady(Boolean(data.token && data.region)))
      .catch(() => setAzureReady(false));
  }, []);

  const options = useMemo(() => {
    const other = LESSONS.map((x) => x.answer).filter((x) => x !== lesson.answer).slice(0, 3);
    return [lesson.answer, ...other].sort(() => 0.5 - Math.random());
  }, [index]);

  function submit(value = answer) {
    const s = scoreText(value, lesson.answer);
    setAnswer(value); setFeedback(s);
    const key = `me-score-${profile}`;
    const old = Number(localStorage.getItem(key) || 0);
    if (s >= 70) localStorage.setItem(key, String(old + 15));
  }

  async function startVoice() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setVoiceStatus('Micro navigateur indisponible. Utilisez la dictée du clavier.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        // V5.3 sécurisée: le navigateur n'obtient jamais la clé Azure.
        // La transcription Azure audio sera branchée sur la fonction serveur à l'étape suivante.
        setVoiceStatus('Enregistrement reçu. Azure est prêt; utilisez aussi la dictée clavier pour une transcription immédiate.');
      };
      recorder.start(); setRecording(true); setVoiceStatus('Je vous écoute…');
    } catch (e) {
      setVoiceStatus(`Micro refusé ou indisponible (${e?.name || 'erreur'}).`);
    }
  }

  function stopVoice() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    setRecording(false);
  }

  if (!profile) return <div className="app"><main><section className="hero"><h1>🇪🇸 Mi Español</h1><p>Qui apprend aujourd’hui ?</p><div className="pills"><button onClick={() => setProfile('Patricia')}>Patricia · Niveau 1</button><button onClick={() => setProfile('Marie-Christine')}>Marie-Christine · Niveau 3</button></div></section></main></div>;

  return <div className="app">
    <main>
      <header><div><small>¡Buenos días, {profile}!</small><h1>Mi Español V5.3</h1></div><button onClick={() => { localStorage.removeItem('me-profile'); setProfile(''); }}>Changer de profil</button></header>

      <section className="hero"><h2>6 types d’exercices</h2><div className="pills">{EXERCISE_TYPES.map(([id, label]) => <button className={type === id ? 'on' : ''} key={id} onClick={() => { setType(id); setAnswer(''); setFeedback(null); }}>{label}</button>)}</div></section>

      <section className="coach lesson">
        <p><b>Exercice {index + 1}/{LESSONS.length}</b></p>
        {type === 'qcm' && <><h3>{lesson.fr}</h3><div className="pills">{options.map((o) => <button key={o} onClick={() => submit(o)}>{o}</button>)}</div></>}
        {type === 'translation' && <><h3>Traduisez : {lesson.fr}</h3><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} /><button className="check" onClick={() => submit()}>Corriger</button></>}
        {type === 'ordering' && <><h3>Remettez cette réponse dans le bon ordre :</h3><p>{lesson.answer.split(' ').reverse().join(' ')}</p><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} /><button className="check" onClick={() => submit()}>Corriger</button></>}
        {type === 'fill' && <><h3>Complétez : {lesson.answer.replace(/\b\w+\b/, '_____')}</h3><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Réécrivez la phrase complète" /><button className="check" onClick={() => submit()}>Corriger</button></>}
        {type === 'listening' && <><h3>Écoutez puis répondez :</h3><button className="listen" onClick={() => speak(lesson.es)}>🔊 Écouter</button><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Écrivez la réponse en espagnol" /><button className="check" onClick={() => submit()}>Corriger</button></>}
        {type === 'dialogue' && <><h3>{lesson.es}</h3><button className="listen" onClick={() => speak(lesson.es)}>🔊 Écouter</button><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Répondez en espagnol ou utilisez la dictée du clavier" /><div className="pills"><button onClick={recording ? stopVoice : startVoice}>{recording ? '⏹ Arrêter' : '🎤 Parler'}</button><button onClick={() => submit()}>Corriger</button></div><p><b>Azure Speech :</b> {azureReady ? '✅ connexion serveur prête' : '⚠️ configuration à vérifier'}</p><p><b>Diagnostic :</b> {voiceStatus}</p></>}

        {feedback !== null && <div className="feedback"><b>{feedback}%</b><p>Réponse attendue : {lesson.answer}</p></div>}
        <div className="exerciseNav"><button onClick={() => { setIndex((index - 1 + LESSONS.length) % LESSONS.length); setFeedback(null); setAnswer(''); }}>← Précédent</button><button onClick={() => { setIndex((index + 1) % LESSONS.length); setFeedback(null); setAnswer(''); }}>Suivant →</button></div>
      </section>
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
