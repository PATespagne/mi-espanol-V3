import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { recognizeSpanish } from './speech.js';

const EXERCISE_TYPES = [
  ['qcm', 'QCM'],
  ['translation', 'Traduction'],
  ['ordering', 'Mots mélangés'],
  ['fill', 'Phrase à compléter'],
  ['listening', 'Compréhension'],
  ['dialogue', 'Dialogue vocal']
];

const LESSONS = [
  {
    es: 'Hola, ¿cómo está?',
    fr: 'Bonjour, comment allez-vous ?',
    answer: 'Muy bien, gracias.'
  },
  {
    es: '¿Cómo se llama?',
    fr: 'Comment vous appelez-vous ?',
    answer: 'Me llamo Patricia.'
  },
  {
    es: '¿Dónde está el supermercado?',
    fr: 'Où est le supermarché ?',
    answer: 'Está cerca de aquí.'
  },
  {
    es: '¿Cuánto cuesta?',
    fr: 'Combien cela coûte ?',
    answer: 'Cuesta cinco euros.'
  },
  {
    es: '¿Puede ayudarme?',
    fr: 'Pouvez-vous m’aider ?',
    answer: 'Sí, claro.'
  },
  {
    es: '¿Dónde está el baño?',
    fr: 'Où sont les toilettes ?',
    answer: 'El baño está allí.'
  }
];

const norm = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zñ0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const scoreText = (a, b) => {
  const aa = new Set(norm(a).split(' ').filter(Boolean));
  const bb = new Set(norm(b).split(' ').filter(Boolean));

  if (!aa.size || !bb.size) return 0;

  let common = 0;

  aa.forEach((w) => {
    if (bb.has(w)) common += 1;
  });

  return Math.round((2 * common / (aa.size + bb.size)) * 100);
};

function speak(text, rate = 0.85) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES';
  u.rate = rate;

  window.speechSynthesis.speak(u);
}

function App() {
  const [profile, setProfile] = useState(
    () => localStorage.getItem('me-profile') || ''
  );

  const [type, setType] = useState('qcm');
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [voiceStatus, setVoiceStatus] = useState('Prêt');
  const [recording, setRecording] = useState(false);
  const [azureReady, setAzureReady] = useState(false);

  const lesson = LESSONS[index];

  useEffect(() => {
    if (profile) {
      localStorage.setItem('me-profile', profile);
    }
  }, [profile]);

  useEffect(() => {
    fetch('/api/speech-token')
      .then((r) => {
        if (!r.ok) throw new Error('Azure Speech indisponible');
        return r.json();
      })
      .then((data) => {
        setAzureReady(Boolean(data.token && data.region));
      })
      .catch(() => {
        setAzureReady(false);
      });
  }, []);

  const options = useMemo(() => {
    const other = LESSONS
      .map((x) => x.answer)
      .filter((x) => x !== lesson.answer)
      .slice(0, 3);

    return [lesson.answer, ...other]
      .sort(() => 0.5 - Math.random());
  }, [index, lesson.answer]);

  function submit(value = answer) {
    const s = scoreText(value, 
