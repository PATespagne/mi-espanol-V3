import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Home, BookOpen, MessageCircle, Activity, Mic, MicOff, Volume2,
  Users, Stethoscope, Building2, ShieldCheck, HeartPulse, Landmark,
  Car, Flame, Sparkles, Award, ChevronLeft, ChevronRight, CheckCircle
} from 'lucide-react';
import './style.css';

const STORAGE_PREFIX = 'mi-espanol-v4';
const ACTIVE_PROFILE_KEY = `${STORAGE_PREFIX}-active-profile`;
const PROFILE_NAMES = ['Patricia', 'Marie-Christine'];

const createDefaultProfile = () => ({
  version: 4,
  stats: { xp: 0, words: 0, oral: 0 },
  completed: {},
  history: []
});

function profileStorageKey(name) {
  return `${STORAGE_PREFIX}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function loadProfile(name) {
  try {
    const saved = localStorage.getItem(profileStorageKey(name));
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...createDefaultProfile(),
        ...parsed,
        stats: { ...createDefaultProfile().stats, ...(parsed.stats || {}) },
        completed: parsed.completed || {},
        history: Array.isArray(parsed.history) ? parsed.history : []
      };
    }

    // Migration automatique des données de la V3 vers la V4.
    const oldUsers = JSON.parse(localStorage.getItem('mi-users-v3-1') || 'null');
    const oldCompleted = JSON.parse(localStorage.getItem('mi-completed-v3-1') || 'null');
    const oldHistory = JSON.parse(localStorage.getItem('mi-history-v3-1') || 'null');
    const migrated = {
      ...createDefaultProfile(),
      stats: { ...createDefaultProfile().stats, ...(oldUsers?.[name] || {}) },
      completed: oldCompleted?.[name] || {},
      history: Array.isArray(oldHistory) ? oldHistory.filter((item) => item.who === name) : []
    };
    localStorage.setItem(profileStorageKey(name), JSON.stringify(migrated));
    return migrated;
  } catch (error) {
    console.error('Chargement impossible :', error);
    return createDefaultProfile();
  }
}

function saveProfile(name, data) {
  if (!name || !data) return;
  try {
    localStorage.setItem(profileStorageKey(name), JSON.stringify(data));
  } catch (error) {
    console.error('Sauvegarde impossible :', error);
  }
}

const catalog = {
  daily: {
    title: '1. Vie quotidienne', icon: Home,
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
    title: '2. Famille', icon: Users,
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
    title: '3. Médecin', icon: Stethoscope,
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
    title: '4. Pharmacie', icon: HeartPulse,
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
    title: '5. Administration', icon: Building2,
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
    title: '6. Banque', icon: Landmark,
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
    title: '7. Assurances', icon: ShieldCheck,
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
    title: '8. Automobile', icon: Car,
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

const normalize = (value) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zñ ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function distance(a, b) {
  const left = normalize(a);
  const right = normalize(b);
  const matrix = Array.from({ length: left.length + 1 }, () =>
    Array(right.length + 1).fill(0)
  );
  for (let index = 0; index <= left.length; index += 1) matrix[index][0] = index;
  for (let index = 0; index <= right.length; index += 1) matrix[0][index] = index;
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

function calculateScore(a, b) {
  const maxLength = Math.max(normalize(a).length, normalize(b).length, 1);
  return Math.max(0, Math.round((1 - distance(a, b) / maxLength) * 100));
}

function speak(text, rate = 0.9) {
  if (!('speechSynthesis' in window)) {
    alert('Lecture vocale non disponible sur ce navigateur.');
    return;
  }
  window.speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = 'es-ES';
  voice.rate = rate;
  window.speechSynthesis.speak(voice);
}

function App() {
  const [who, setWho] = useState(() => localStorage.getItem(ACTIVE_PROFILE_KEY) || '');
  const [profileData, setProfileData] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [tab, setTab] = useState('home');
  const [category, setCategory] = useState('daily');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!who) {
      setProfileData(null);
      setProfileLoaded(false);
      return;
    }
    setProfileLoaded(false);
    setProfileData(loadProfile(who));
    localStorage.setItem(ACTIVE_PROFILE_KEY, who);
    setProfileLoaded(true);
  }, [who]);

  useEffect(() => {
    if (who && profileData && profileLoaded) saveProfile(who, profileData);
  }, [who, profileData, profileLoaded]);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  const Recognition = useMemo(
    () => window.SpeechRecognition || window.webkitSpeechRecognition,
    []
  );

  function selectProfile(name) {
    setProfileLoaded(false);
    setProfileData(null);
    setWho(name);
  }

  function changeProfile() {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
    setWho('');
    setProfileData(null);
    setProfileLoaded(false);
    setTab('home');
    resetAttempt();
  }

  if (!who) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'linear-gradient(135deg,#fff8e1,#ffe0b2)', fontFamily: 'Arial,sans-serif' }}>
        <section style={{ width: '100%', maxWidth: 520, padding: 32, background: '#fff', borderRadius: 24, textAlign: 'center', boxShadow: '0 12px 35px rgba(0,0,0,.12)' }}>
          <div style={{ fontSize: 64 }}>🇪🇸</div>
          <h1 style={{ color: '#c62828', marginBottom: 8 }}>Mi Español</h1>
          <p style={{ color: '#555', fontSize: 18, marginBottom: 28 }}>Qui apprend aujourd’hui ?</p>
          <div style={{ display: 'grid', gap: 14 }}>
            {PROFILE_NAMES.map((name) => (
              <button key={name} type="button" onClick={() => selectProfile(name)} style={{ padding: 18, border: 0, borderRadius: 16, cursor: 'pointer', fontWeight: 700, fontSize: 18, background: '#f5f5f5', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>
                👤 {name}
              </button>
            ))}
          </div>
          <p style={{ marginTop: 24, color: '#777', fontSize: 14 }}>Même URL, progressions séparées, sans mot de passe</p>
        </section>
      </div>
    );
  }

  if (!profileLoaded || !profileData) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Chargement de la progression…</div>;
  }

  const user = profileData.stats;
  const completed = profileData.completed;
  const history = profileData.history;
  const categoryData = catalog[category];
  const exercise = categoryData.items[exerciseIndex];
  const exerciseKey = `${category}-${exerciseIndex}`;
  const doneCount = Object.keys(completed).length;
  const totalExercises = Object.values(catalog).reduce((sum, module) => sum + module.items.length, 0);

  function resetAttempt() {
    setText('');
    setResult(null);
    setError('');
  }

  function openExercise(categoryId, index = 0) {
    setCategory(categoryId);
    setExerciseIndex(index);
    resetAttempt();
    setTab('talk');
  }

  function move(delta) {
    const length = categoryData.items.length;
    setExerciseIndex((exerciseIndex + delta + length) % length);
    resetAttempt();
  }

  function saveAttempt(answer) {
    const value = calculateScore(answer, exercise[2]);
    const firstSuccess = value >= 70 && !completed[exerciseKey];
    setResult(value);
    setProfileData((current) => ({
      ...current,
      stats: {
        ...current.stats,
        xp: current.stats.xp + (value >= 70 ? 15 : 5),
        words: current.stats.words + (firstSuccess ? normalize(exercise[2]).split(' ').length : 0),
        oral: Math.min(100, Math.round(((current.stats.oral * Math.max(doneCount, 1)) + value) / (Math.max(doneCount, 1) + 1)))
      },
      completed: value >= 70
        ? { ...current.completed, [exerciseKey]: true }
        : current.completed,
      history: [
        { who, category: categoryData.title, exercise: exerciseIndex + 1, text: answer, score: value, date: new Date().toLocaleDateString('fr-FR') },
        ...current.history
      ].slice(0, 60)
    }));
  }

  function listen() {
    setError('');
    if (!Recognition) {
      setError('Reconnaissance vocale indisponible. Utilisez Safari récent et autorisez le micro.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => { setListening(true); setResult(null); };
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      setListening(false);
      setError(event.error === 'not-allowed'
        ? 'Autorisez le micro dans les réglages du navigateur.'
        : 'Je n’ai pas compris. Réessayez lentement.');
    };
    recognition.onresult = (event) => {
      const answer = event.results[0][0].transcript;
      setText(answer);
      saveAttempt(answer);
    };
    recognition.start();
  }

  return (
    <div className="app">
      <aside>
        <h2>🇪🇸 Mi Español</h2>
        {[
          ['home', 'Accueil', Home], ['path', 'Parcours', BookOpen],
          ['talk', 'Coach vocal', MessageCircle], ['progress', 'Progression', Activity]
        ].map(([id, label, Icon]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}><Icon /> {label}</button>
        ))}
      </aside>

      <main>
        <header>
          <div><small>¡Buenos días, {who}!</small><h1>Objectif Espagne</h1></div>
          <div className="profiles">
            <strong>👤 {who}</strong>
            <button type="button" onClick={changeProfile}>Changer de profil</button>
          </div>
        </header>

        {tab === 'home' && <>
          <section className="hero">
            <h2>Parler en Espagne, pour de vrai.</h2>
            <p>{totalExercises} exercices pratiques avec entraînement vocal et progression individuelle.</p>
            <button onClick={() => openExercise('daily')}>🎤 Commencer à parler</button>
          </section>
          <div className="stats">
            <article><Flame /><b>{user.xp}</b><span>XP</span></article>
            <article><Sparkles /><b>{user.words}</b><span>Mots</span></article>
            <article><Award /><b>{user.oral}%</b><span>Oral</span></article>
            <article><CheckCircle /><b>{doneCount}/{totalExercises}</b><span>Réussis</span></article>
          </div>
        </>}

        {tab === 'path' && <>
          <h2>Parcours Vie en Espagne</h2>
          <div className="grid">
            {Object.entries(catalog).map(([id, module]) => {
              const Icon = module.icon;
              const count = module.items.filter((_, index) => completed[`${id}-${index}`]).length;
              return <article key={id} onClick={() => openExercise(id)}>
                <Icon /><h3>{module.title}</h3><p>{module.description}</p>
                <strong>{count}/{module.items.length} exercices réussis</strong>
              </article>;
            })}
          </div>
        </>}

        {tab === 'talk' && <>
          <h2>Coach vocal</h2>
          <div className="pills">
            {Object.entries(catalog).map(([id, module]) => (
              <button key={id} className={category === id ? 'on' : ''} onClick={() => openExercise(id)}>{module.title.replace(/^\d+\. /, '')}</button>
            ))}
          </div>
          <div className="conversationLayout">
            <div className="exerciseList">
              <h3>{categoryData.title}</h3>
              {categoryData.items.map((item, index) => (
                <button key={index} className={`${exerciseIndex === index ? 'on' : ''} ${completed[`${category}-${index}`] ? 'done' : ''}`} onClick={() => openExercise(category, index)}>
                  {index + 1}. {item[1]}
                </button>
              ))}
            </div>
            <section className="coach lesson">
              <p><b>Exercice {exerciseIndex + 1} / {categoryData.items.length}</b></p>
              <h3>{exercise[0]}</h3><p>{exercise[1]}</p>
              <div className="audio">
                <button className="listen" onClick={() => speak(exercise[0], 0.7)}><Volume2 /> Lent</button>
                <button className="listen" onClick={() => speak(exercise[0], 1)}><Volume2 /> Normal</button>
              </div>
              <div className="target"><b>Réponse à prononcer</b><h3>{exercise[2]}</h3><p>Prononciation : {exercise[3]}</p></div>
              <textarea value={text} onChange={(event) => { setText(event.target.value); setResult(null); }} placeholder="Répondez au micro ou écrivez ici…" />
              <button className={`mic ${listening ? 'live' : ''}`} onClick={listen}>
                {listening ? <MicOff /> : <Mic />}{listening ? ' Je vous écoute…' : ' Répondre au micro'}
              </button>
              {error && <p className="error">{error}</p>}
              <button className="check" disabled={!text.trim()} onClick={() => saveAttempt(text)}>Corriger</button>
              {result !== null && <div className="feedback">
                <b className={result >= 70 ? 'good' : 'retry'}>{result}%</b>
                <p>✅ Modèle : {exercise[2]}</p><p>🗣 Prononciation : {exercise[3]}</p>
                <p>{result >= 85 ? 'Bravo, très bonne réponse.' : result >= 70 ? 'Bien joué. Répétez encore une fois.' : 'Reprenez lentement, mot par mot.'}</p>
              </div>}
              <div className="exerciseNav">
                <button onClick={() => move(-1)}><ChevronLeft /> Précédent</button>
                <button onClick={() => move(1)}>Suivant <ChevronRight /></button>
              </div>
            </section>
          </div>
        </>}

        {tab === 'progress' && <>
          <h2>Progression de {who}</h2>
          <div className="progress"><b>Expression orale</b><span>{user.oral}%</span><i><em style={{ width: `${user.oral}%` }} /></i></div>
          <p>{doneCount} exercices réussis sur {totalExercises}.</p>
          <section className="history"><h3>Historique oral</h3>
            {history.length ? history.map((item, index) => (
              <article key={`${item.date}-${index}`}>
                <b>{item.category} · exercice {item.exercise}</b>
                <strong className={item.score >= 70 ? 'good' : 'retry'}>{item.score}%</strong>
                <p>« {item.text} »</p><small>{item.date}</small>
              </article>
            )) : <p>Aucun essai vocal.</p>}
          </section>
        </>}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
