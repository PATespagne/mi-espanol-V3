import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Home, BookOpen, MessageCircle, Activity, Mic, MicOff, Volume2,
  Users, Stethoscope, Building2, ShieldCheck, HeartPulse, Landmark,
  Car, Flame, Sparkles, Award, ChevronLeft, ChevronRight, CheckCircle,
  Target, Trophy, Shuffle, PenLine, ListChecks, Headphones, MessagesSquare
} from 'lucide-react';
import './style.css';

const STORAGE_PREFIX = 'mi-espanol-v5-2';
const PREVIOUS_PREFIXES = ['mi-espanol-v5-1', 'mi-espanol-v4'];
const ACTIVE_PROFILE_KEY = `${STORAGE_PREFIX}-active-profile`;
const PROFILE_NAMES = ['Patricia', 'Marie-Christine'];
const DAILY_GOAL = 5;

const PROFILE_SETTINGS = {
  Patricia: { startingLevel: 1, startingXp: 0 },
  'Marie-Christine': { startingLevel: 3, startingXp: 1000 }
};

const LEVELS = [
  { level: 1, name: 'Débutante', minXp: 0 },
  { level: 2, name: 'Exploratrice', minXp: 350 },
  { level: 3, name: 'Vie quotidienne', minXp: 1000 },
  { level: 4, name: 'Autonome', minXp: 2000 },
  { level: 5, name: 'Prête pour l’Espagne', minXp: 3500 }
];

const EXERCISE_TYPES = [
  { id: 'qcm', label: 'QCM', icon: ListChecks },
  { id: 'translation', label: 'Traduction', icon: PenLine },
  { id: 'ordering', label: 'Mots mélangés', icon: Shuffle },
  { id: 'fill', label: 'Phrase à compléter', icon: BookOpen },
  { id: 'listening', label: 'Compréhension', icon: Headphones },
  { id: 'dialogue', label: 'Dialogue', icon: MessagesSquare }
];

const catalog = {
  daily: {
    title: '1. Vie quotidienne', icon: Home, minLevel: 1,
    description: 'Se présenter, faire les courses, se repérer et échanger au quotidien',
    items: [
      ['Hola, ¿cómo está?', 'Bonjour, comment allez-vous ?', 'Muy bien, gracias. ¿Y usted?', 'mouï biène, grassias, i oustèd'],
      ['¿Cómo se llama?', 'Comment vous appelez-vous ?', 'Me llamo Patricia.', 'mé yamo Patricia'],
      ['¿De dónde es?', 'D’où êtes-vous ?', 'Soy de Bélgica.', 'soï dé Bèl-hika'],
      ['¿Habla francés?', 'Parlez-vous français ?', 'Sí, hablo francés.', 'si, ablo fransès'],
      ['¿Dónde está el supermercado?', 'Où est le supermarché ?', 'Está cerca de aquí.', 'ésta sèrka dé aki'],
      ['¿Qué hora es?', 'Quelle heure est-il ?', 'Son las diez.', 'son las dièss'],
      ['¿Cuánto cuesta?', 'Combien cela coûte ?', 'Cuesta cinco euros.', 'kouèsta sinko é-ouros'],
      ['¿Puede ayudarme?', 'Pouvez-vous m’aider ?', 'Sí, claro.', 'si, klaro'],
      ['¿Dónde está el baño?', 'Où sont les toilettes ?', 'El baño está allí.', 'èl bagno ésta ayi'],
      ['Hasta mañana.', 'À demain.', 'Hasta mañana.', 'asta magnana']
    ]
  },
  family: {
    title: '2. Famille', icon: Users, minLevel: 1,
    description: 'Repas, journée, projets et échanges avec les proches',
    items: [
      ['¿Cómo está la familia?', 'Comment va la famille ?', 'La familia está bien.', 'la familia ésta biène'],
      ['¿Tienes hijos?', 'As-tu des enfants ?', 'Sí, tengo dos hijos.', 'si, tèn-go dos ihos'],
      ['¿Quién es ella?', 'Qui est-elle ?', 'Ella es mi hermana.', 'éya ès mi èrmana'],
      ['¿Qué has hecho hoy?', 'Qu’as-tu fait aujourd’hui ?', 'Hoy he ido al mercado.', 'oï é ido al markado'],
      ['¿Quieres comer con nosotros?', 'Veux-tu manger avec nous ?', 'Sí, con mucho gusto.', 'si, kon moutcho gousto'],
      ['¿A qué hora cenamos?', 'À quelle heure dînons-nous ?', 'Cenamos a las ocho.', 'sénamos a las otcho'],
      ['¿Te gusta la comida?', 'Aimes-tu le repas ?', 'Sí, está muy rico.', 'si, ésta mouï riko'],
      ['¿Cómo se llama tu madre?', 'Comment s’appelle ta mère ?', 'Mi madre se llama Ana.', 'mi madré sé yama Ana'],
      ['¿Vienes mañana?', 'Viens-tu demain ?', 'Sí, vengo mañana.', 'si, bèn-go magnana'],
      ['Buenas noches, familia.', 'Bonne nuit, la famille.', 'Buenas noches.', 'bouénas notchès']
    ]
  },
  doctor: {
    title: '3. Médecin', icon: Stethoscope, minLevel: 2,
    description: 'Symptômes, rendez-vous, allergies et traitements',
    items: [
      ['¿Qué le pasa?', 'Qu’est-ce qui vous arrive ?', 'Tengo dolor de cabeza.', 'tèn-go dolor dé kabéssa'],
      ['¿Tiene fiebre?', 'Avez-vous de la fièvre ?', 'Sí, tengo fiebre.', 'si, tèn-go fièbré'],
      ['¿Desde cuándo?', 'Depuis quand ?', 'Desde ayer.', 'dèsdé ayièr'],
      ['¿Dónde le duele?', 'Où avez-vous mal ?', 'Me duele el estómago.', 'mé douélé èl èstomago'],
      ['¿Tiene alergias?', 'Avez-vous des allergies ?', 'Soy alérgica a la penicilina.', 'soï alèrhika a la pénissilina'],
      ['¿Toma medicamentos?', 'Prenez-vous des médicaments ?', 'No tomo medicamentos.', 'no tomo médikamèntos'],
      ['Respire profundamente.', 'Respirez profondément.', 'De acuerdo.', 'dé akouèrdo'],
      ['Necesita descansar.', 'Vous devez vous reposer.', 'Gracias, doctor.', 'grassias, doktor'],
      ['¿Necesita una receta?', 'Avez-vous besoin d’une ordonnance ?', 'Sí, por favor.', 'si, por favor'],
      ['¿Cuándo vuelve?', 'Quand revenez-vous ?', 'Vuelvo la próxima semana.', 'bouèlbo la proksima sémana']
    ]
  },
  pharmacy: {
    title: '4. Pharmacie', icon: HeartPulse, minLevel: 2,
    description: 'Médicaments, ordonnance, posologie et allergies',
    items: [
      ['¿Qué necesita?', 'De quoi avez-vous besoin ?', 'Necesito algo para el dolor.', 'nésséssito algo para èl dolor'],
      ['¿Tiene receta?', 'Avez-vous une ordonnance ?', 'Sí, aquí está.', 'si, aki ésta'],
      ['¿Tiene alergias?', 'Avez-vous des allergies ?', 'No tengo alergias.', 'no tèn-go alèrhias'],
      ['¿Cómo debe tomarlo?', 'Comment devez-vous le prendre ?', 'Una vez al día.', 'ouna bèss al dia'],
      ['¿Antes o después de comer?', 'Avant ou après manger ?', 'Después de comer.', 'dèspouès dé komèr'],
      ['¿Necesita una crema?', 'Avez-vous besoin d’une crème ?', 'Necesito una crema para la piel.', 'nésséssito ouna kréma para la pièl'],
      ['¿Tiene tos?', 'Avez-vous de la toux ?', 'Necesito un jarabe.', 'nésséssito oun harabé'],
      ['¿Cuánto cuesta?', 'Combien cela coûte ?', 'Cuesta ocho euros.', 'kouèsta otcho é-ouros'],
      ['¿Tiene paracetamol?', 'Avez-vous du paracétamol ?', 'Sí, tenemos.', 'si, ténémos'],
      ['Gracias por su ayuda.', 'Merci pour votre aide.', 'De nada.', 'dé nada']
    ]
  },
  admin: {
    title: '5. Administration', icon: Building2, minLevel: 3,
    description: 'NIE, mairie, rendez-vous et documents officiels',
    items: [
      ['¿Tiene cita previa?', 'Avez-vous rendez-vous ?', 'Sí, tengo cita a las diez.', 'si, tèn-go sita a las dièss'],
      ['¿Tiene el pasaporte?', 'Avez-vous le passeport ?', 'Sí, aquí lo tiene.', 'si, aki lo tiéné'],
      ['¿Qué trámite necesita?', 'Quelle démarche devez-vous faire ?', 'Necesito solicitar el NIE.', 'nésséssito solissitar èl nié'],
      ['¿Cuál es su dirección?', 'Quelle est votre adresse ?', 'Vivo en Alicante.', 'bibo èn Alikanté'],
      ['Firme aquí, por favor.', 'Signez ici, s’il vous plaît.', 'Sí, claro.', 'si, klaro'],
      ['Falta un documento.', 'Il manque un document.', '¿Qué documento falta?', 'ké dokoumènto falta'],
      ['¿Qué desea solicitar?', 'Que souhaitez-vous demander ?', 'Quiero empadronarme.', 'kièro èmpadronarmé'],
      ['¿Cuándo estará listo?', 'Quand sera-t-il prêt ?', 'Estará listo mañana.', 'èstara listo magnana'],
      ['¿Necesita una copia?', 'Avez-vous besoin d’une copie ?', 'Sí, necesito una copia.', 'si, nésséssito ouna kopia'],
      ['Gracias, buenos días.', 'Merci, bonne journée.', 'Buenos días.', 'bouénos dias']
    ]
  },
  bank: {
    title: '6. Banque', icon: Landmark, minLevel: 3,
    description: 'Compte bancaire, carte, virement et retrait',
    items: [
      ['¿En qué puedo ayudarle?', 'Comment puis-je vous aider ?', 'Quiero abrir una cuenta.', 'kièro abrir ouna kouènta'],
      ['¿Tiene identificación?', 'Avez-vous une pièce d’identité ?', 'Sí, tengo mi pasaporte.', 'si, tèn-go mi passaporté'],
      ['¿Qué tarjeta necesita?', 'De quelle carte avez-vous besoin ?', 'Necesito una tarjeta de débito.', 'nésséssito ouna tarhéta dé débito'],
      ['¿Qué desea hacer?', 'Que souhaitez-vous faire ?', 'Quiero hacer una transferencia.', 'kièro assèr ouna transferènsia'],
      ['¿Qué ha pasado?', 'Que s’est-il passé ?', 'He perdido mi tarjeta.', 'é pèrdido mi tarhéta'],
      ['¿Cuál es la comisión?', 'Quels sont les frais ?', 'La comisión es de dos euros.', 'la komision ès dé dos é-ouros'],
      ['¿Quiere retirar dinero?', 'Voulez-vous retirer de l’argent ?', 'Sí, quiero retirar dinero.', 'si, kièro rétirar dinéro'],
      ['¿Recuerda su PIN?', 'Vous souvenez-vous de votre code PIN ?', 'No recuerdo mi PIN.', 'no rékouèrdo mi pin'],
      ['¿Quiere consultar el saldo?', 'Voulez-vous consulter le solde ?', 'Sí, quiero saber mi saldo.', 'si, kièro sabèr mi saldo'],
      ['Gracias por su ayuda.', 'Merci pour votre aide.', 'De nada.', 'dé nada']
    ]
  },
  insurance: {
    title: '7. Assurances', icon: ShieldCheck, minLevel: 3,
    description: 'Contrat, devis, franchise, assistance et sinistre',
    items: [
      ['¿Qué desea asegurar?', 'Que souhaitez-vous assurer ?', 'Quiero asegurar mi coche.', 'kièro asségourar mi kotché'],
      ['¿Qué necesita?', 'De quoi avez-vous besoin ?', 'Quiero pedir un presupuesto.', 'kièro pédir oun présoupouèsto'],
      ['¿Cuál es la franquicia?', 'Quel est le montant de la franchise ?', 'La franquicia es de doscientos euros.', 'la frankissia ès dé dossièntos é-ouros'],
      ['¿Qué desea declarar?', 'Que souhaitez-vous déclarer ?', 'Quiero declarar un siniestro.', 'kièro déclarar oun sinièstro'],
      ['¿Qué ha ocurrido?', 'Que s’est-il passé ?', 'He tenido un accidente.', 'é ténido oun aksidènté'],
      ['¿Qué está roto?', 'Qu’est-ce qui est cassé ?', 'Tengo un cristal roto.', 'tèn-go oun kristal roto'],
      ['¿Necesita asistencia?', 'Avez-vous besoin d’assistance ?', 'Sí, necesito asistencia.', 'si, nésséssito assistènsia'],
      ['¿Qué desea cambiar?', 'Que souhaitez-vous modifier ?', 'Quiero cambiar el contrato.', 'kièro kambiar èl kontrato'],
      ['¿Está cubierto?', 'Est-ce couvert ?', 'Sí, está cubierto.', 'si, ésta koubièrto'],
      ['¿Qué desea cancelar?', 'Que souhaitez-vous résilier ?', 'Quiero cancelar la póliza.', 'kièro kansélar la polissa']
    ]
  },
  car: {
    title: '8. Automobile', icon: Car, minLevel: 3,
    description: 'Garage, panne, réparation, contrôle et dépannage',
    items: [
      ['¿Cuál es el problema?', 'Quel est le problème ?', 'El coche no arranca.', 'èl kotché no arranka'],
      ['¿Qué ha pasado?', 'Que s’est-il passé ?', 'Tengo una rueda pinchada.', 'tèn-go ouna rouéda pintchada'],
      ['¿Qué luz se ha encendido?', 'Quel voyant s’est allumé ?', 'Se ha encendido una luz roja.', 'sé a ènsèndido ouna louss roha'],
      ['¿Qué necesita?', 'De quoi avez-vous besoin ?', 'Necesito una revisión.', 'nésséssito ouna rébision'],
      ['¿Cuánto cuesta la reparación?', 'Combien coûte la réparation ?', 'Cuesta cien euros.', 'kouèsta siène é-ouros'],
      ['¿Qué ruido hace?', 'Quel bruit fait-il ?', 'El motor hace ruido.', 'èl motor assé rouido'],
      ['¿Necesita pasar la ITV?', 'Devez-vous passer le contrôle technique ?', 'Sí, necesito pasar la ITV.', 'si, nésséssito passar la ité-ou-bé'],
      ['¿Cuándo estará listo?', 'Quand sera-t-il prêt ?', 'Estará listo esta tarde.', 'èstara listo èsta tardé'],
      ['¿Necesita una grúa?', 'Avez-vous besoin d’une dépanneuse ?', 'Sí, necesito una grúa.', 'si, nésséssito ouna groua'],
      ['¿Cómo quiere pagar?', 'Comment souhaitez-vous payer ?', 'Quiero pagar con tarjeta.', 'kièro pagar kon tarhéta']
    ]
  }
};

const normalize = (value = '') => value.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-zñ0-9 ]/g, ' ')
  .replace(/\s+/g, ' ').trim();

function distance(a, b) {
  const left = normalize(a);
  const right = normalize(b);
  const matrix = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));
  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1)
      );
    }
  }
  return matrix[left.length][right.length];
}

function calculateScore(answer, expected) {
  const maxLength = Math.max(normalize(answer).length, normalize(expected).length, 1);
  return Math.max(0, Math.round((1 - distance(answer, expected) / maxLength) * 100));
}

function deterministicShuffle(values, seed = 1) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = (seed * 7 + i * 3) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function speak(text, rate = 0.9) {
  if (!('speechSynthesis' in window)) {
    alert('Lecture vocale non disponible sur ce navigateur.');
    return;
  }
  speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = 'es-ES';
  voice.rate = rate;
  speechSynthesis.speak(voice);
}

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function storageKey(name, prefix = STORAGE_PREFIX) {
  return `${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function createDefaultProfile(name) {
  return {
    version: 5.2,
    stats: { xp: PROFILE_SETTINGS[name]?.startingXp || 0, words: 0, oral: 0 },
    completed: {}, history: [], activityDates: [], mistakes: {}
  };
}

function mergeProfile(name, source = {}) {
  const defaults = createDefaultProfile(name);
  return {
    ...defaults, ...source, version: 5.2,
    stats: {
      ...defaults.stats, ...(source.stats || {}),
      xp: Math.max(defaults.stats.xp, Number(source.stats?.xp || 0))
    },
    completed: source.completed || {},
    history: Array.isArray(source.history) ? source.history : [],
    activityDates: Array.isArray(source.activityDates) ? source.activityDates : [],
    mistakes: source.mistakes || {}
  };
}

function loadProfile(name) {
  try {
    const current = localStorage.getItem(storageKey(name));
    if (current) return mergeProfile(name, JSON.parse(current));
    for (const prefix of PREVIOUS_PREFIXES) {
      const saved = localStorage.getItem(storageKey(name, prefix));
      if (saved) {
        const migrated = mergeProfile(name, JSON.parse(saved));
        localStorage.setItem(storageKey(name), JSON.stringify(migrated));
        return migrated;
      }
    }
    return createDefaultProfile(name);
  } catch (error) {
    console.error('Chargement impossible :', error);
    return createDefaultProfile(name);
  }
}

function saveProfile(name, data) {
  try { localStorage.setItem(storageKey(name), JSON.stringify(data)); }
  catch (error) { console.error('Sauvegarde impossible :', error); }
}

function getLevel(xp, name) {
  const starting = PROFILE_SETTINGS[name]?.startingLevel || 1;
  const earned = [...LEVELS].reverse().find((item) => xp >= item.minXp)?.level || 1;
  return LEVELS.find((item) => item.level === Math.max(starting, earned)) || LEVELS[0];
}

function calculateStreak(dates = []) {
  const unique = new Set(dates);
  let cursor = new Date();
  let streak = 0;
  if (!unique.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (unique.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function getBadges(profile) {
  const count = Object.keys(profile.completed || {}).length;
  const badges = [];
  if (count >= 1) badges.push('Premier pas');
  if (count >= 10) badges.push('10 exercices réussis');
  if (count >= 25) badges.push('Exploratrice');
  if (count >= 50) badges.push('Grande voyageuse');
  if (profile.stats.oral >= 85) badges.push('Belle prononciation');
  if (calculateStreak(profile.activityDates) >= 3) badges.push('Série de 3 jours');
  return badges;
}

function App() {
  const [who, setWho] = useState(() => localStorage.getItem(ACTIVE_PROFILE_KEY) || '');
  const [profileData, setProfileData] = useState(null);
  const [tab, setTab] = useState('home');
  const [category, setCategory] = useState('daily');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [type, setType] = useState('qcm');
  const [answer, setAnswer] = useState('');
  const [selectedWords, setSelectedWords] = useState([]);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!who) { setProfileData(null); return; }
    setProfileData(loadProfile(who));
    localStorage.setItem(ACTIVE_PROFILE_KEY, who);
  }, [who]);

  useEffect(() => {
    if (who && profileData) saveProfile(who, profileData);
  }, [who, profileData]);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  const Recognition = useMemo(() => window.SpeechRecognition || window.webkitSpeechRecognition, []);

  function resetAttempt(nextType = type) {
    setType(nextType);
    setAnswer('');
    setSelectedWords([]);
    setResult(null);
    setError('');
  }

  function changeProfile() {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
    setWho(''); setProfileData(null); setTab('home'); resetAttempt('qcm');
  }

  if (!who) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'linear-gradient(135deg,#fff8e1,#ffe0b2)', fontFamily: 'Arial,sans-serif' }}>
        <section style={{ width: '100%', maxWidth: 520, padding: 32, background: '#fff', borderRadius: 24, textAlign: 'center', boxShadow: '0 12px 35px rgba(0,0,0,.12)' }}>
          <div style={{ fontSize: 64 }}>🇪🇸</div><h1 style={{ color: '#c62828' }}>Mi Español</h1>
          <p>Qui apprend aujourd’hui ?</p>
          <div style={{ display: 'grid', gap: 14 }}>
            {PROFILE_NAMES.map((name) => <button key={name} onClick={() => setWho(name)} style={{ padding: 18, border: 0, borderRadius: 16, fontWeight: 700, fontSize: 18 }}>👤 {name} · Niveau {PROFILE_SETTINGS[name].startingLevel}</button>)}
          </div>
        </section>
      </div>
    );
  }

  if (!profileData) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Chargement…</div>;

  const user = profileData.stats;
  const completed = profileData.completed;
  const history = profileData.history;
  const module = catalog[category];
  const item = module.items[exerciseIndex];
  const level = getLevel(user.xp, who);
  const streak = calculateStreak(profileData.activityDates);
  const badges = getBadges(profileData);
  const completionKey = `${category}-${exerciseIndex}-${type}`;
  const doneCount = Object.keys(completed).length;
  const totalActivities = Object.values(catalog).reduce((sum, entry) => sum + entry.items.length * EXERCISE_TYPES.length, 0);
  const todayAttempts = history.filter((entry) => entry.dayKey === localDateKey()).length;
  const dailyProgress = Math.min(DAILY_GOAL, todayAttempts);
  const currentType = EXERCISE_TYPES.find((entry) => entry.id === type);

  const options = useMemo(() => {
    if (!module) return [];
    const correct = type === 'listening' ? item[1] : item[2];
    const candidates = module.items.map((entry) => type === 'listening' ? entry[1] : entry[2]).filter((value) => value !== correct);
    return deterministicShuffle([correct, ...deterministicShuffle(candidates, exerciseIndex + 3).slice(0, 3)], exerciseIndex + type.length);
  }, [category, exerciseIndex, type]);

  const orderedWords = useMemo(() => deterministicShuffle(item[2].replace(/[.,¿?¡!]/g, '').split(/\s+/), exerciseIndex + 8), [category, exerciseIndex]);
  const fillWords = item[2].replace(/[.,¿?¡!]/g, '').split(/\s+/);
  const missingIndex = Math.min(1, fillWords.length - 1);
  const missingWord = fillWords[missingIndex] || '';
  const fillSentence = item[2].replace(missingWord, '_____');

  function isUnlocked(entry) { return level.level >= entry.minLevel; }

  function openExercise(categoryId, index = 0, requestedType = type) {
    if (!isUnlocked(catalog[categoryId])) {
      alert(`Ce thème se débloque au niveau ${catalog[categoryId].minLevel}.`); return;
    }
    setCategory(categoryId); setExerciseIndex(index); resetAttempt(requestedType); setTab('practice');
  }

  function expectedAnswer() {
    if (type === 'ordering') return item[2].replace(/[.,¿?¡!]/g, '');
    if (type === 'fill') return missingWord;
    if (type === 'listening') return item[1];
    return item[2];
  }

  function submit(value = answer) {
    const expected = expectedAnswer();
    const score = calculateScore(value, expected);
    const success = score >= 70;
    setAnswer(value); setResult(score);
    setProfileData((current) => {
      const firstSuccess = success && !current.completed[completionKey];
      const dayKey = localDateKey();
      return {
        ...current,
        stats: {
          ...current.stats,
          xp: current.stats.xp + (success ? 15 : 5),
          words: current.stats.words + (firstSuccess ? normalize(expected).split(' ').length : 0),
          oral: type === 'dialogue'
            ? Math.round((current.stats.oral + score) / (current.stats.oral ? 2 : 1))
            : current.stats.oral
        },
        completed: success ? { ...current.completed, [completionKey]: true } : current.completed,
        mistakes: success
          ? { ...current.mistakes, [completionKey]: Math.max(0, (current.mistakes[completionKey] || 0) - 1) }
          : { ...current.mistakes, [completionKey]: (current.mistakes[completionKey] || 0) + 1 },
        activityDates: Array.from(new Set([...(current.activityDates || []), dayKey])),
        history: [{ category: module.title, exercise: exerciseIndex + 1, type: currentType.label, text: value, score, date: new Date().toLocaleDateString('fr-FR'), dayKey }, ...current.history].slice(0, 120)
      };
    });
  }

  function move(delta) {
    const next = (exerciseIndex + delta + module.items.length) % module.items.length;
    setExerciseIndex(next);
    resetAttempt(EXERCISE_TYPES[next % EXERCISE_TYPES.length].id);
  }

  function addWord(word, index) {
    const next = [...selectedWords, { word, index }];
    setSelectedWords(next);
    setAnswer(next.map((entry) => entry.word).join(' '));
  }

  function removeWord(position) {
    const next = selectedWords.filter((_, index) => index !== position);
    setSelectedWords(next); setAnswer(next.map((entry) => entry.word).join(' '));
  }

  function startRecognition() {
    if (!Recognition) { setError('Reconnaissance vocale indisponible. Écrivez votre réponse.'); return; }
    const recognition = new Recognition();
    recognition.lang = 'es-ES'; recognition.interimResults = false;
    recognition.onstart = () => { setListening(true); setError(''); };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); setError('Je n’ai pas compris. Réessayez lentement.'); };
    recognition.onresult = (event) => { const value = event.results[0][0].transcript; setAnswer(value); submit(value); };
    recognition.start();
  }

  function renderExercise() {
    if (type === 'qcm') return <>
      <p>Choisissez la bonne réponse en espagnol :</p><h3>{item[1]}</h3>
      <div className="pills">{options.map((option) => <button key={option} onClick={() => submit(option)}>{option}</button>)}</div>
    </>;

    if (type === 'translation') return <>
      <p>Traduisez en espagnol :</p><h3>{item[1]}</h3>
      <textarea value={answer} onChange={(event) => { setAnswer(event.target.value); setResult(null); }} placeholder="Écrivez la traduction…" />
      <button className="check" disabled={!answer.trim()} onClick={() => submit()}>Corriger</button>
    </>;

    if (type === 'ordering') return <>
      <p>Remettez les mots dans le bon ordre :</p><h3>{item[1]}</h3>
      <div className="target"><p>{selectedWords.length ? selectedWords.map((entry, index) => <button key={`${entry.index}-${index}`} onClick={() => removeWord(index)}>{entry.word}</button>) : 'Touchez les mots ci-dessous'}</p></div>
      <div className="pills">{orderedWords.map((word, index) => <button key={`${word}-${index}`} disabled={selectedWords.some((entry) => entry.index === index)} onClick={() => addWord(word, index)}>{word}</button>)}</div>
      <button className="check" disabled={!answer.trim()} onClick={() => submit()}>Corriger</button>
    </>;

    if (type === 'fill') return <>
      <p>Complétez la phrase :</p><h3>{fillSentence}</h3><p>{item[1]}</p>
      <input value={answer} onChange={(event) => { setAnswer(event.target.value); setResult(null); }} placeholder="Mot manquant" style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid #ddd', marginBottom: 12 }} />
      <button className="check" disabled={!answer.trim()} onClick={() => submit()}>Corriger</button>
    </>;

    if (type === 'listening') return <>
      <p>Écoutez puis choisissez la bonne signification :</p>
      <button className="listen" onClick={() => speak(item[2], 0.85)}><Volume2 /> Écouter la phrase</button>
      <div className="pills">{options.map((option) => <button key={option} onClick={() => submit(option)}>{option}</button>)}</div>
    </>;

    return <>
      <p>Répondez dans ce dialogue :</p><h3>{item[0]}</h3><p>{item[1]}</p>
      <div className="audio"><button className="listen" onClick={() => speak(item[0], 0.8)}><Volume2 /> Écouter</button></div>
      <textarea value={answer} onChange={(event) => { setAnswer(event.target.value); setResult(null); }} placeholder="Répondez en espagnol…" />
      <button className={`mic ${listening ? 'live' : ''}`} onClick={startRecognition}>{listening ? <MicOff /> : <Mic />} {listening ? 'Je vous écoute…' : 'Répondre au micro'}</button>
      {error && <p className="error">{error}</p>}
      <button className="check" disabled={!answer.trim()} onClick={() => submit()}>Corriger</button>
    </>;
  }

  return <div className="app">
    <aside><h2>🇪🇸 Mi Español</h2>{[
      ['home', 'Accueil', Home], ['path', 'Parcours', BookOpen],
      ['practice', 'Exercices', MessageCircle], ['progress', 'Progression', Activity]
    ].map(([id, label, Icon]) => <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}><Icon /> {label}</button>)}</aside>

    <main><header><div><small>¡Buenos días, {who}!</small><h1>Objectif Espagne</h1></div><div className="profiles"><strong>👤 {who} · Niveau {level.level}</strong><button onClick={changeProfile}>Changer de profil</button></div></header>

      {tab === 'home' && <><section className="hero"><h2>Six façons d’apprendre, sans limite quotidienne.</h2><p>QCM, traduction, mots mélangés, phrase à compléter, compréhension et dialogue.</p><button onClick={() => openExercise(who === 'Marie-Christine' ? 'admin' : 'daily', 0, 'qcm')}>Commencer</button></section>
      <div className="stats"><article><Flame /><b>{streak}</b><span>Jours</span></article><article><Sparkles /><b>{user.xp}</b><span>XP</span></article><article><Award /><b>Niveau {level.level}</b><span>{level.name}</span></article><article><CheckCircle /><b>{doneCount}/{totalActivities}</b><span>Activités</span></article></div>
      <section className="hero" style={{ marginTop: 20 }}><h3><Target /> Défi du jour : {dailyProgress}/{DAILY_GOAL}</h3><div className="progress"><i><em style={{ width: `${dailyProgress / DAILY_GOAL * 100}%` }} /></i></div><p>{dailyProgress >= DAILY_GOAL ? '🏆 Défi réussi. Continuez autant que vous voulez.' : 'Chaque activité fait progresser le défi.'}</p></section></>}

      {tab === 'path' && <><h2>Parcours Vie en Espagne</h2><div className="grid">{Object.entries(catalog).map(([id, entry]) => { const Icon = entry.icon; const unlocked = isUnlocked(entry); const count = Object.keys(completed).filter((key) => key.startsWith(`${id}-`)).length; return <article key={id} onClick={() => openExercise(id, 0, 'qcm')} style={{ opacity: unlocked ? 1 : .5 }}><Icon /><h3>{entry.title}</h3><p>{entry.description}</p><strong>{unlocked ? `${count}/${entry.items.length * 6} activités` : `🔒 Niveau ${entry.minLevel}`}</strong></article>; })}</div></>}

      {tab === 'practice' && <><h2>{currentType.icon && React.createElement(currentType.icon)} {currentType.label}</h2>
        <div className="pills">{EXERCISE_TYPES.map((entry) => <button key={entry.id} className={type === entry.id ? 'on' : ''} onClick={() => resetAttempt(entry.id)}>{entry.label}</button>)}</div>
        <div className="pills">{Object.entries(catalog).map(([id, entry]) => <button key={id} disabled={!isUnlocked(entry)} className={category === id ? 'on' : ''} onClick={() => openExercise(id, 0, type)}>{entry.title.replace(/^\d+\. /, '')}{!isUnlocked(entry) ? ' 🔒' : ''}</button>)}</div>
        <section className="coach lesson"><p><b>{module.title} · exercice {exerciseIndex + 1}/{module.items.length}</b></p>{renderExercise()}
        {result !== null && <div className="feedback"><b className={result >= 70 ? 'good' : 'retry'}>{result}%</b><p>Réponse attendue : {expectedAnswer()}</p><p>{result >= 85 ? 'Excellent !' : result >= 70 ? 'Bien joué.' : 'À revoir. Cet exercice reviendra dans les révisions.'}</p></div>}
        <div className="exerciseNav"><button onClick={() => move(-1)}><ChevronLeft /> Précédent</button><button onClick={() => move(1)}>Suivant <ChevronRight /></button></div></section></>}

      {tab === 'progress' && <><h2>Progression de {who}</h2><div className="stats"><article><Award /><b>Niveau {level.level}</b><span>{level.name}</span></article><article><Sparkles /><b>{user.xp}</b><span>XP</span></article><article><Flame /><b>{streak}</b><span>Jours</span></article><article><Trophy /><b>{badges.length}</b><span>Badges</span></article></div>
      <section className="history"><h3>🏆 Badges</h3>{badges.length ? badges.map((badge) => <article key={badge}><b>{badge}</b></article>) : <p>Le premier badge arrivera après une activité réussie.</p>}</section>
      <section className="history"><h3>Historique</h3>{history.length ? history.map((entry, index) => <article key={`${entry.date}-${index}`}><b>{entry.category} · {entry.type}</b><strong className={entry.score >= 70 ? 'good' : 'retry'}>{entry.score}%</strong><p>« {entry.text} »</p><small>{entry.date}</small></article>) : <p>Aucune activité.</p>}</section></>}
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
