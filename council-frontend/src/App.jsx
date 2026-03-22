import { useState, useRef, useEffect, useCallback } from "react";

const API_URL = "https://councail.onrender.com";

// ── Supported languages ───────────────────────────────────────
const LANGUAGES = [
  { code:"en", label:"English",    flag:"🇬🇧" },
  { code:"es", label:"Español",    flag:"🇪🇸" },
  { code:"fr", label:"Français",   flag:"🇫🇷" },
  { code:"de", label:"Deutsch",    flag:"🇩🇪" },
  { code:"pt", label:"Português",  flag:"🇧🇷" },
  { code:"it", label:"Italiano",   flag:"🇮🇹" },
  { code:"nl", label:"Nederlands", flag:"🇳🇱" },
  { code:"zh", label:"中文",        flag:"🇨🇳" },
  { code:"ja", label:"日本語",      flag:"🇯🇵" },
  { code:"ar", label:"العربية",    flag:"🇸🇦" },
];

const UI = {
  en: {
    title:"THE COUNCIL", subtitle:"Assemble your council. You control who speaks.", enterChamber:"Enter the Chamber",
    selectMembers:"Council Members", alwaysPresent:"always present", selectAtLeast:"Select at least 2 council members",
    convene:"Enter the Chamber →", danDesc:"Opens the debate. Questions the council. Delivers the final verdict.",
    questionPlaceholder:"What is your question for the council?", councilAwaits:"The council awaits your question.",
    conveneCouncil:"Convene the Council →", speakTruth:"Speak your truth…",
    beforeConvenes:"Before the council convenes, I must understand your situation.",
    whoSpeaks:"Who shall speak?", danSpeaks:"Dan speaks", hearVerdict:"Hear the verdict",
    theCouncilSpoke:"The council has spoken", danReady:"Dan is ready to deliver his judgment.",
    anotherQuestion:"Pose another question to the council, or take your leave.",
    followUpPlaceholder:"Another question…", leave:"Leave", leaveCouncil:"Leave the Chamber", sessionComplete:"The council has spoken. Return when you have another question.", respondingToDan:"responding to Dan",
    stanceShifted:"stance shifted", collapse:"collapse", expand:"expand",
    whatEstablished:"What was established", for:"For", against:"Against", theJudgment:"The Judgment",
    chooseLanguage:"Choose your language", danJudge:"Dan — The Judge", dansJudgment:"Dan's Judgment",
    councilPrepares:"The council prepares…", danDeliberates:"Dan deliberates…",
    danWrites:"Dan writes his judgment…", respondsToDan:"responds to Dan",
  },
  es: {
    title:"EL CONSEJO", subtitle:"Reúne a tu consejo. Tú controlas quién habla.", enterChamber:"Entrar a la Cámara",
    selectMembers:"Miembros del Consejo", alwaysPresent:"siempre presente", selectAtLeast:"Selecciona al menos 2 miembros",
    convene:"Entrar a la Cámara →", danDesc:"Abre el debate. Interroga al consejo. Dicta el veredicto final.",
    questionPlaceholder:"¿Cuál es tu pregunta para el consejo?", councilAwaits:"El consejo aguarda tu pregunta.",
    conveneCouncil:"Convocar el Consejo →", speakTruth:"Habla tu verdad…",
    beforeConvenes:"Antes de que el consejo se reúna, debo entender tu situación.",
    whoSpeaks:"¿Quién hablará?", danSpeaks:"Dan habla", hearVerdict:"Escuchar el veredicto",
    theCouncilSpoke:"El consejo ha deliberado", danReady:"Dan está listo para dictar su juicio.",
    anotherQuestion:"Plantea otra pregunta al consejo, o retírate.",
    followUpPlaceholder:"Otra pregunta…", leave:"Salir", leaveCouncil:"Abandonar la Cámara", sessionComplete:"El consejo ha hablado. Regresa cuando tengas otra pregunta.", respondingToDan:"respondiendo a Dan",
    stanceShifted:"posición cambiada", collapse:"colapsar", expand:"expandir",
    whatEstablished:"Lo que se estableció", for:"A favor", against:"En contra", theJudgment:"El Juicio",
    chooseLanguage:"Elige tu idioma", danJudge:"Dan — El Juez", dansJudgment:"El Juicio de Dan",
    councilPrepares:"El consejo se prepara…", danDeliberates:"Dan delibera…",
    danWrites:"Dan escribe su juicio…", respondsToDan:"responde a Dan",
  },
  fr: {
    title:"LE CONSEIL", subtitle:"Assemblez votre conseil. Vous contrôlez qui parle.", enterChamber:"Entrer dans la Chambre",
    selectMembers:"Membres du Conseil", alwaysPresent:"toujours présent", selectAtLeast:"Sélectionnez au moins 2 membres",
    convene:"Entrer dans la Chambre →", danDesc:"Ouvre le débat. Interroge le conseil. Rend le verdict final.",
    questionPlaceholder:"Quelle est votre question pour le conseil?", councilAwaits:"Le conseil attend votre question.",
    conveneCouncil:"Réunir le Conseil →", speakTruth:"Parlez votre vérité…",
    beforeConvenes:"Avant que le conseil se réunisse, je dois comprendre votre situation.",
    whoSpeaks:"Qui parlera?", danSpeaks:"Dan parle", hearVerdict:"Entendre le verdict",
    theCouncilSpoke:"Le conseil a délibéré", danReady:"Dan est prêt à rendre son jugement.",
    anotherQuestion:"Posez une autre question au conseil, ou prenez congé.",
    followUpPlaceholder:"Une autre question…", leave:"Partir", leaveCouncil:"Quitter la Chambre", sessionComplete:"Le conseil a parlé. Revenez quand vous aurez une autre question.", respondingToDan:"répondant à Dan",
    stanceShifted:"position changée", collapse:"réduire", expand:"développer",
    whatEstablished:"Ce qui a été établi", for:"Pour", against:"Contre", theJudgment:"Le Jugement",
    chooseLanguage:"Choisissez votre langue", danJudge:"Dan — Le Juge", dansJudgment:"Le Jugement de Dan",
    councilPrepares:"Le conseil se prépare…", danDeliberates:"Dan délibère…",
    danWrites:"Dan rédige son jugement…", respondsToDan:"répond à Dan",
  },
  de: {
    title:"DER RAT", subtitle:"Stellen Sie Ihren Rat zusammen. Sie bestimmen, wer spricht.", enterChamber:"Die Kammer betreten",
    selectMembers:"Ratsmitglieder", alwaysPresent:"immer anwesend", selectAtLeast:"Mindestens 2 Mitglieder wählen",
    convene:"Die Kammer betreten →", danDesc:"Eröffnet die Debatte. Befragt den Rat. Fällt das endgültige Urteil.",
    questionPlaceholder:"Was ist Ihre Frage an den Rat?", councilAwaits:"Der Rat wartet auf Ihre Frage.",
    conveneCouncil:"Den Rat einberufen →", speakTruth:"Sprechen Sie Ihre Wahrheit…",
    beforeConvenes:"Bevor der Rat zusammentritt, muss ich Ihre Situation verstehen.",
    whoSpeaks:"Wer wird sprechen?", danSpeaks:"Dan spricht", hearVerdict:"Das Urteil hören",
    theCouncilSpoke:"Der Rat hat gesprochen", danReady:"Dan ist bereit, sein Urteil zu sprechen.",
    anotherQuestion:"Stellen Sie eine weitere Frage an den Rat, oder nehmen Sie Abschied.",
    followUpPlaceholder:"Eine weitere Frage…", leave:"Verlassen", leaveCouncil:"Die Kammer verlassen", sessionComplete:"Der Rat hat gesprochen. Kehren Sie zurück, wenn Sie eine weitere Frage haben.", respondingToDan:"antwortet Dan",
    stanceShifted:"Haltung geändert", collapse:"einklappen", expand:"ausklappen",
    whatEstablished:"Was festgestellt wurde", for:"Dafür", against:"Dagegen", theJudgment:"Das Urteil",
    chooseLanguage:"Sprache wählen", danJudge:"Dan — Der Richter", dansJudgment:"Dans Urteil",
    councilPrepares:"Der Rat bereitet sich vor…", danDeliberates:"Dan überlegt…",
    danWrites:"Dan schreibt sein Urteil…", respondsToDan:"antwortet Dan",
  },
  pt: {
    title:"O CONSELHO", subtitle:"Monte seu conselho. Você controla quem fala.", enterChamber:"Entrar na Câmara",
    selectMembers:"Membros do Conselho", alwaysPresent:"sempre presente", selectAtLeast:"Selecione pelo menos 2 membros",
    convene:"Entrar na Câmara →", danDesc:"Abre o debate. Questiona o conselho. Entrega o veredicto final.",
    questionPlaceholder:"Qual é a sua pergunta para o conselho?", councilAwaits:"O conselho aguarda a sua pergunta.",
    conveneCouncil:"Convocar o Conselho →", speakTruth:"Fale a sua verdade…",
    beforeConvenes:"Antes do conselho se reunir, preciso entender a sua situação.",
    whoSpeaks:"Quem falará?", danSpeaks:"Dan fala", hearVerdict:"Ouvir o veredicto",
    theCouncilSpoke:"O conselho deliberou", danReady:"Dan está pronto para proferir o seu julgamento.",
    anotherQuestion:"Faça outra pergunta ao conselho, ou despeça-se.",
    followUpPlaceholder:"Outra pergunta…", leave:"Sair", leaveCouncil:"Deixar a Câmara", sessionComplete:"O conselho falou. Volte quando tiver outra pergunta.", respondingToDan:"respondendo a Dan",
    stanceShifted:"posição alterada", collapse:"recolher", expand:"expandir",
    whatEstablished:"O que foi estabelecido", for:"A favor", against:"Contra", theJudgment:"O Julgamento",
    chooseLanguage:"Escolha o idioma", danJudge:"Dan — O Juiz", dansJudgment:"O Julgamento de Dan",
    councilPrepares:"O conselho se prepara…", danDeliberates:"Dan delibera…",
    danWrites:"Dan escreve seu julgamento…", respondsToDan:"responde a Dan",
  },
  it: {
    title:"IL CONSIGLIO", subtitle:"Assembla il tuo consiglio. Controlli chi parla.", enterChamber:"Entra nella Camera",
    selectMembers:"Membri del Consiglio", alwaysPresent:"sempre presente", selectAtLeast:"Seleziona almeno 2 membri",
    convene:"Entra nella Camera →", danDesc:"Apre il dibattito. Interroga il consiglio. Emette il verdetto finale.",
    questionPlaceholder:"Qual è la tua domanda per il consiglio?", councilAwaits:"Il consiglio attende la tua domanda.",
    conveneCouncil:"Convocare il Consiglio →", speakTruth:"Parla la tua verità…",
    beforeConvenes:"Prima che il consiglio si riunisca, devo capire la tua situazione.",
    whoSpeaks:"Chi parlerà?", danSpeaks:"Dan parla", hearVerdict:"Ascolta il verdetto",
    theCouncilSpoke:"Il consiglio ha deliberato", danReady:"Dan è pronto a pronunciare il suo giudizio.",
    anotherQuestion:"Poni un'altra domanda al consiglio, o prendi commiato.",
    followUpPlaceholder:"Un'altra domanda…", leave:"Uscire", leaveCouncil:"Lasciare la Camera", sessionComplete:"Il consiglio ha parlato. Torna quando avrai un'altra domanda.", respondingToDan:"risponde a Dan",
    stanceShifted:"posizione cambiata", collapse:"comprimi", expand:"espandi",
    whatEstablished:"Ciò che è stato stabilito", for:"A favore", against:"Contro", theJudgment:"Il Giudizio",
    chooseLanguage:"Scegli la lingua", danJudge:"Dan — Il Giudice", dansJudgment:"Il Giudizio di Dan",
    councilPrepares:"Il consiglio si prepara…", danDeliberates:"Dan delibera…",
    danWrites:"Dan scrive il suo giudizio…", respondsToDan:"risponde a Dan",
  },
  nl: {
    title:"DE RAAD", subtitle:"Stel uw raad samen. U bepaalt wie spreekt.", enterChamber:"De Kamer betreden",
    selectMembers:"Raadsleden", alwaysPresent:"altijd aanwezig", selectAtLeast:"Selecteer minimaal 2 leden",
    convene:"De Kamer betreden →", danDesc:"Opent het debat. Ondervraagt de raad. Velt het eindoordeel.",
    questionPlaceholder:"Wat is uw vraag voor de raad?", councilAwaits:"De raad wacht op uw vraag.",
    conveneCouncil:"De Raad bijeen roepen →", speakTruth:"Spreek uw waarheid…",
    beforeConvenes:"Voordat de raad bijeenkomt, moet ik uw situatie begrijpen.",
    whoSpeaks:"Wie zal spreken?", danSpeaks:"Dan spreekt", hearVerdict:"Het oordeel horen",
    theCouncilSpoke:"De raad heeft gesproken", danReady:"Dan is klaar om zijn oordeel uit te spreken.",
    anotherQuestion:"Stel de raad nog een vraag, of neem afscheid.",
    followUpPlaceholder:"Nog een vraag…", leave:"Vertrekken", leaveCouncil:"De Kamer verlaten", sessionComplete:"De raad heeft gesproken. Kom terug wanneer u een andere vraag heeft.", respondingToDan:"antwoord aan Dan",
    stanceShifted:"standpunt gewijzigd", collapse:"inklappen", expand:"uitklappen",
    whatEstablished:"Wat is vastgesteld", for:"Voor", against:"Tegen", theJudgment:"Het Oordeel",
    chooseLanguage:"Kies taal", danJudge:"Dan — De Rechter", dansJudgment:"Dans Oordeel",
    councilPrepares:"De raad bereidt zich voor…", danDeliberates:"Dan delibereert…",
    danWrites:"Dan schrijft zijn oordeel…", respondsToDan:"antwoordt Dan",
  },
  zh: {
    title:"议会", subtitle:"组建你的议会。你控制谁发言。", enterChamber:"进入议事厅",
    selectMembers:"议会成员", alwaysPresent:"始终在场", selectAtLeast:"请至少选择2名成员",
    convene:"进入议事厅 →", danDesc:"主持辩论。审问议会。宣布最终裁决。",
    questionPlaceholder:"您对议会的问题是什么？", councilAwaits:"议会等待您的问题。",
    conveneCouncil:"召集议会 →", speakTruth:"说出您的真相…",
    beforeConvenes:"议会召开前，我需要了解您的情况。",
    whoSpeaks:"谁来发言？", danSpeaks:"丹发言", hearVerdict:"听取裁决",
    theCouncilSpoke:"议会已经审议", danReady:"丹已准备好宣布他的判决。",
    anotherQuestion:"向议会再提一个问题，或告辞。",
    followUpPlaceholder:"另一个问题…", leave:"离开", leaveCouncil:"离开议事厅", sessionComplete:"议会已经发言。有其他问题时请回来。", respondingToDan:"回应丹",
    stanceShifted:"立场转变", collapse:"收起", expand:"展开",
    whatEstablished:"已确立的内容", for:"支持", against:"反对", theJudgment:"判决",
    chooseLanguage:"选择语言", danJudge:"丹 — 法官", dansJudgment:"丹的判决",
    councilPrepares:"议会准备中…", danDeliberates:"丹在审议…",
    danWrites:"丹正在写判决…", respondsToDan:"回应丹",
  },
  ja: {
    title:"評議会", subtitle:"評議会を編成してください。誰が発言するかはあなたが決めます。", enterChamber:"議場に入る",
    selectMembers:"議会メンバー", alwaysPresent:"常に出席", selectAtLeast:"少なくとも2人のメンバーを選択",
    convene:"議場に入る →", danDesc:"討論を開始します。議会を尋問します。最終判決を下します。",
    questionPlaceholder:"議会への質問は何ですか？", councilAwaits:"議会はあなたの質問を待っています。",
    conveneCouncil:"議会を召集する →", speakTruth:"あなたの真実を語ってください…",
    beforeConvenes:"議会が開かれる前に、あなたの状況を理解する必要があります。",
    whoSpeaks:"誰が話しますか？", danSpeaks:"ダンが話す", hearVerdict:"判決を聞く",
    theCouncilSpoke:"議会が審議しました", danReady:"ダンは判決を下す準備ができています。",
    anotherQuestion:"議会にもう一つ質問するか、おいとまください。",
    followUpPlaceholder:"もう一つの質問…", leave:"退出", leaveCouncil:"議場を去る", sessionComplete:"評議会は語りました。別の質問があるときに戻ってください。", respondingToDan:"ダンへの返答",
    stanceShifted:"立場が変わった", collapse:"折りたたむ", expand:"展開する",
    whatEstablished:"確立されたこと", for:"賛成", against:"反対", theJudgment:"判決",
    chooseLanguage:"言語を選択", danJudge:"ダン — 裁判官", dansJudgment:"ダンの判決",
    councilPrepares:"評議会が準備中…", danDeliberates:"ダンが審議中…",
    danWrites:"ダンが判決を書いています…", respondsToDan:"ダンに返答",
  },
  ar: {
    title:"المجلس", subtitle:"اجمع مجلسك. أنت تتحكم في من يتكلم.", enterChamber:"الدخول إلى القاعة",
    selectMembers:"أعضاء المجلس", alwaysPresent:"حاضر دائماً", selectAtLeast:"اختر عضوين على الأقل",
    convene:"الدخول إلى القاعة →", danDesc:"يفتح النقاش. يستجوب المجلس. يصدر الحكم النهائي.",
    questionPlaceholder:"ما هو سؤالك للمجلس؟", councilAwaits:"المجلس ينتظر سؤالك.",
    conveneCouncil:"عقد جلسة المجلس →", speakTruth:"قل حقيقتك…",
    beforeConvenes:"قبل انعقاد المجلس، يجب أن أفهم وضعك.",
    whoSpeaks:"من سيتكلم؟", danSpeaks:"دان يتكلم", hearVerdict:"استمع إلى الحكم",
    theCouncilSpoke:"تداول المجلس", danReady:"دان مستعد لإصدار حكمه.",
    anotherQuestion:"اطرح سؤالاً آخر على المجلس، أو انصرف.",
    followUpPlaceholder:"سؤال آخر…", leave:"المغادرة", leaveCouncil:"مغادرة القاعة", sessionComplete:"تحدث المجلس. عد عندما يكون لديك سؤال آخر.", respondingToDan:"رداً على دان",
    stanceShifted:"تغير الموقف", collapse:"طي", expand:"توسيع",
    whatEstablished:"ما تم إثباته", for:"مع", against:"ضد", theJudgment:"الحكم",
    chooseLanguage:"اختر اللغة", danJudge:"دان — القاضي", dansJudgment:"حكم دان",
    councilPrepares:"المجلس يستعد…", danDeliberates:"دان يتداول…",
    danWrites:"دان يكتب حكمه…", respondsToDan:"يرد على دان",
  },
};

const CHARACTERS = {
  surfer:    { id:"surfer",    name:"Maui",     title:"The Surfer",    emoji:"🏄", color:"#38bdf8", avatarBg:"#0c1f2e", description:"Risk & instinct. Reads situations like waves.", lens:"risk & instinct",       tagline:"The wave is forming. Will you paddle?" },
  inspector: { id:"inspector", name:"Lamia",    title:"The Inspector", emoji:"🔍", color:"#e879f9", avatarBg:"#1e0a2e", description:"Evidence & detail. Finds what others miss.",   lens:"evidence & detail",      tagline:"The truth is in what no one examined." },
  artist:    { id:"artist",    name:"Severn",   title:"The Artist",    emoji:"🎨", color:"#fb923c", avatarBg:"#2e1200", description:"Creativity & freedom. Challenges the premise.", lens:"creativity & freedom",   tagline:"The question itself may be the trap." },
  monk:      { id:"monk",      name:"Hoyt",     title:"The Monk",      emoji:"🧘", color:"#4ade80", avatarBg:"#021a0e", description:"Long-term & meaning. The 10-year lens.",        lens:"long-term meaning",      tagline:"In ten years, which choice will you mourn?" },
  general:   { id:"general",   name:"Morpurgo", title:"The General",   emoji:"⚔️", color:"#facc15", avatarBg:"#1a1400", description:"Strategy & consequences. No wishful thinking.", lens:"strategy & consequences",tagline:"Plans fail. Contingencies don't." },
};
const DAN = { id:"dan", name:"Dan", title:"The Judge", emoji:"🧑‍⚖️", color:"#c9a84c", avatarBg:"#0a0800",
  tagline:"I have presided over ten thousand decisions. Bring me yours." };

const hex2rgba = (hex, alpha) => {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const CHAR_FIELDS = {
  en: {
    surfer:    { title:"The Surfer",    description:"Risk & instinct. Reads situations like waves.", lens:"risk & instinct",       tagline:"The wave is forming. Will you paddle?" },
    inspector: { title:"The Inspector", description:"Evidence & detail. Finds what others miss.",   lens:"evidence & detail",      tagline:"The truth is in what no one examined." },
    artist:    { title:"The Artist",    description:"Creativity & freedom. Challenges the premise.", lens:"creativity & freedom",   tagline:"The question itself may be the trap." },
    monk:      { title:"The Monk",      description:"Long-term & meaning. The 10-year lens.",        lens:"long-term meaning",      tagline:"In ten years, which choice will you mourn?" },
    general:   { title:"The General",   description:"Strategy & consequences. No wishful thinking.", lens:"strategy & consequences",tagline:"Plans fail. Contingencies don't." },
    dan:       { title:"The Judge",     description:"Opens the debate. Questions the council. Delivers the final verdict.", lens:"judgment", tagline:"I have presided over ten thousand decisions. Bring me yours." },
  },
  es: {
    surfer:    { title:"El Surfista",   description:"Riesgo e instinto. Lee situaciones como olas.", lens:"riesgo e instinto",      tagline:"La ola se está formando. ¿Vas a remar?" },
    inspector: { title:"La Inspectora", description:"Evidencia y detalle. Encuentra lo que otros pierden.", lens:"evidencia y detalle", tagline:"La verdad está en lo que nadie examinó." },
    artist:    { title:"El Artista",    description:"Creatividad y libertad. Desafía la premisa.",   lens:"creatividad y libertad", tagline:"La pregunta en sí misma puede ser la trampa." },
    monk:      { title:"El Monje",      description:"Largo plazo y significado. La lente de 10 años.", lens:"significado a largo plazo", tagline:"En diez años, ¿qué elección lamentarás?" },
    general:   { title:"El General",    description:"Estrategia y consecuencias. Sin pensamiento ilusorio.", lens:"estrategia y consecuencias", tagline:"Los planes fallan. Las contingencias no." },
    dan:       { title:"El Juez",       description:"Abre el debate. Interroga al consejo. Dicta el veredicto.", lens:"juicio", tagline:"He presidido diez mil decisiones. Tráeme la tuya." },
  },
  fr: {
    surfer:    { title:"Le Surfeur",    description:"Risque et instinct. Lit les situations comme des vagues.", lens:"risque et instinct", tagline:"La vague se forme. Allez-vous ramer?" },
    inspector: { title:"L'Inspectrice", description:"Preuves et détails. Trouve ce que les autres ratent.", lens:"preuves et détails", tagline:"La vérité est dans ce que personne n'a examiné." },
    artist:    { title:"L'Artiste",     description:"Créativité et liberté. Remet en question la prémisse.", lens:"créativité et liberté", tagline:"La question elle-même peut être le piège." },
    monk:      { title:"Le Moine",      description:"Long terme et sens. La lentille des 10 ans.",    lens:"sens à long terme",     tagline:"Dans dix ans, quel choix regretteras-tu?" },
    general:   { title:"Le Général",    description:"Stratégie et conséquences. Pas de pensée illusoire.", lens:"stratégie et conséquences", tagline:"Les plans échouent. Les contingences non." },
    dan:       { title:"Le Juge",       description:"Ouvre le débat. Interroge le conseil. Rend le verdict.", lens:"jugement", tagline:"J'ai présidé dix mille décisions. Apportez-moi la vôtre." },
  },
  de: {
    surfer:    { title:"Der Surfer",    description:"Risiko und Instinkt. Liest Situationen wie Wellen.", lens:"Risiko & Instinkt", tagline:"Die Welle bildet sich. Werden Sie paddeln?" },
    inspector: { title:"Die Inspektorin", description:"Beweise und Details. Findet, was andere übersehen.", lens:"Beweise & Details", tagline:"Die Wahrheit steckt in dem, was niemand untersucht hat." },
    artist:    { title:"Der Künstler",  description:"Kreativität und Freiheit. Hinterfragt die Prämisse.", lens:"Kreativität & Freiheit", tagline:"Die Frage selbst könnte die Falle sein." },
    monk:      { title:"Der Mönch",     description:"Langfristig und bedeutungsvoll. Die 10-Jahres-Linse.", lens:"langfristiger Sinn", tagline:"In zehn Jahren — welche Wahl wirst du bereuen?" },
    general:   { title:"Der General",   description:"Strategie und Konsequenzen. Kein Wunschdenken.", lens:"Strategie & Konsequenzen", tagline:"Pläne scheitern. Notfallpläne nicht." },
    dan:       { title:"Der Richter",   description:"Eröffnet die Debatte. Befragt den Rat. Fällt das Urteil.", lens:"Urteil", tagline:"Ich habe zehntausend Entscheidungen geleitet. Bringen Sie mir Ihre." },
  },
  pt: {
    surfer:    { title:"O Surfista",    description:"Risco e instinto. Lê situações como ondas.", lens:"risco e instinto", tagline:"A onda está se formando. Você vai remar?" },
    inspector: { title:"A Inspetora",   description:"Evidências e detalhes. Encontra o que outros perdem.", lens:"evidências e detalhes", tagline:"A verdade está no que ninguém examinou." },
    artist:    { title:"O Artista",     description:"Criatividade e liberdade. Desafia a premissa.", lens:"criatividade e liberdade", tagline:"A própria pergunta pode ser a armadilha." },
    monk:      { title:"O Monge",       description:"Longo prazo e significado. A lente de 10 anos.", lens:"significado a longo prazo", tagline:"Em dez anos, qual escolha você vai lamentar?" },
    general:   { title:"O General",     description:"Estratégia e consequências. Sem pensamento ilusório.", lens:"estratégia e consequências", tagline:"Os planos falham. As contingências não." },
    dan:       { title:"O Juiz",        description:"Abre o debate. Questiona o conselho. Entrega o veredicto.", lens:"julgamento", tagline:"Presidi dez mil decisões. Traga-me a sua." },
  },
  it: {
    surfer:    { title:"Il Surfista",   description:"Rischio e istinto. Legge le situazioni come onde.", lens:"rischio e istinto", tagline:"L'onda si sta formando. Remerai?" },
    inspector: { title:"L'Ispettrice",  description:"Prove e dettagli. Trova ciò che gli altri perdono.", lens:"prove e dettagli", tagline:"La verità è in ciò che nessuno ha esaminato." },
    artist:    { title:"L'Artista",     description:"Creatività e libertà. Sfida la premessa.", lens:"creatività e libertà", tagline:"La domanda stessa potrebbe essere la trappola." },
    monk:      { title:"Il Monaco",     description:"Lungo termine e significato. La lente dei 10 anni.", lens:"significato a lungo termine", tagline:"Tra dieci anni, quale scelta rimpiangerai?" },
    general:   { title:"Il Generale",   description:"Strategia e conseguenze. Niente pensiero illusorio.", lens:"strategia e conseguenze", tagline:"I piani falliscono. I piani di riserva no." },
    dan:       { title:"Il Giudice",    description:"Apre il dibattito. Interroga il consiglio. Emette il verdetto.", lens:"giudizio", tagline:"Ho presieduto diecimila decisioni. Portami la tua." },
  },
  nl: {
    surfer:    { title:"De Surfer",     description:"Risico en instinct. Leest situaties als golven.", lens:"risico & instinct", tagline:"De golf vormt zich. Ga je peddelen?" },
    inspector: { title:"De Inspectrice",description:"Bewijs en detail. Vindt wat anderen missen.", lens:"bewijs & detail", tagline:"De waarheid zit in wat niemand heeft onderzocht." },
    artist:    { title:"De Kunstenaar", description:"Creativiteit en vrijheid. Daagt de premisse uit.", lens:"creativiteit & vrijheid", tagline:"De vraag zelf kan de val zijn." },
    monk:      { title:"De Monnik",     description:"Lange termijn en betekenis. De 10-jaars lens.", lens:"langetermijnbetekenis", tagline:"Over tien jaar — welke keuze zul je betreuren?" },
    general:   { title:"De Generaal",   description:"Strategie en gevolgen. Geen wensdenken.", lens:"strategie & gevolgen", tagline:"Plannen mislukken. Noodplannen niet." },
    dan:       { title:"De Rechter",    description:"Opent het debat. Ondervraagt de raad. Velt het oordeel.", lens:"oordeel", tagline:"Ik heb tienduizend beslissingen voorgezeten. Breng me die van jou." },
  },
  zh: {
    surfer:    { title:"冲浪者",   description:"风险与直觉。像波浪一样读懂局势。", lens:"风险与直觉", tagline:"浪头正在形成。你会划水吗？" },
    inspector: { title:"调查员",   description:"证据与细节。发现他人遗漏的东西。", lens:"证据与细节", tagline:"真相藏在无人检视之处。" },
    artist:    { title:"艺术家",   description:"创造力与自由。挑战前提假设。", lens:"创造力与自由", tagline:"问题本身可能就是陷阱。" },
    monk:      { title:"僧侣",     description:"长远与意义。十年维度的视角。", lens:"长远意义", tagline:"十年后，你会为哪个选择而惋惜？" },
    general:   { title:"将军",     description:"战略与后果。不容一厢情愿。", lens:"战略与后果", tagline:"计划会失败。应急方案不会。" },
    dan:       { title:"法官",     description:"主持辩论。审问议会。宣布最终裁决。", lens:"判断", tagline:"我已主持过一万次决策。把你的带来吧。" },
  },
  ja: {
    surfer:    { title:"サーファー",     description:"リスクと直感。波のように状況を読む。", lens:"リスクと直感", tagline:"波が形成されています。漕ぎ出しますか？" },
    inspector: { title:"インスペクター", description:"証拠と細部。他が見逃すものを見つける。", lens:"証拠と細部", tagline:"真実は誰も調べなかったものの中にある。" },
    artist:    { title:"アーティスト",   description:"創造性と自由。前提に挑戦する。", lens:"創造性と自由", tagline:"質問自体が罠かもしれない。" },
    monk:      { title:"僧侣",           description:"長期的視点と意味。10年のレンズ。", lens:"長期的意味", tagline:"10年後、どの選択を後悔しますか？" },
    general:   { title:"将軍",           description:"戦略と結果。希望的観測は不要。", lens:"戦略と結果", tagline:"計画は失敗する。コンティンジェンシーは失敗しない。" },
    dan:       { title:"裁判官",         description:"討論を開始し、議会を尋問し、最終判決を下す。", lens:"判断", tagline:"私は一万の決断を主宰してきた。あなたのを持ってきてください。" },
  },
  ar: {
    surfer:    { title:"المتزلج",  description:"المخاطرة والحدس. يقرأ المواقف كالأمواج.", lens:"المخاطرة والحدس", tagline:"الموجة تتشكل. هل ستجدف؟" },
    inspector: { title:"المحققة",  description:"الأدلة والتفاصيل. تجد ما يفوت الآخرين.", lens:"الأدلة والتفاصيل", tagline:"الحقيقة فيما لم يفحصه أحد." },
    artist:    { title:"الفنان",   description:"الإبداع والحرية. يتحدى الافتراض.", lens:"الإبداع والحرية", tagline:"السؤال نفسه قد يكون الفخ." },
    monk:      { title:"الراهب",   description:"المدى البعيد والمعنى. عدسة العشر سنوات.", lens:"المعنى بعيد المدى", tagline:"بعد عشر سنوات، أي قرار ستندم عليه؟" },
    general:   { title:"الجنرال",  description:"الاستراتيجية والعواقب. لا مجال للتمني.", lens:"الاستراتيجية والعواقب", tagline:"الخطط تفشل. خطط الطوارئ لا تفشل." },
    dan:       { title:"القاضي",   description:"يفتح النقاش ويستجوب المجلس ويصدر الحكم النهائي.", lens:"الحكم", tagline:"ترأست عشرة آلاف قرار. أحضر لي قرارك." },
  },
};
const getCharFields = (charId, lang) => {
  const fields = CHAR_FIELDS[lang] || CHAR_FIELDS.en;
  return fields[charId] || (CHAR_FIELDS.en[charId] || {});
};

const useTypewriter = (text, speed=18, enabled=true) => {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const [done, setDone] = useState(!enabled);
  useEffect(() => {
    if(!enabled){ setDisplayed(text); setDone(true); return; }
    setDisplayed(""); setDone(false);
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if(i >= text.length){ clearInterval(tick); setDone(true); }
    }, speed);
    return () => clearInterval(tick);
  }, [text, speed, enabled]);
  return { displayed, done };
};

const ParsedText = ({ text, fontSize="15px", color="#c8b99a", serif=true }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span style={{ fontSize, color, lineHeight:"1.8", fontFamily: serif?"'Palatino Linotype','Palatino','Book Antiqua',serif":"inherit" }}>
      {parts.map((p,i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} style={{ color:"#f5e6c8", fontWeight:700 }}>{p.slice(2,-2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
};

const Avatar = ({ char, size=56, active=false, glow=false }) => {
  const c = char.color;
  const bg = char.avatarBg || "#0a0a18";
  const shadow = glow
    ? `0 0 0 1px ${hex2rgba(c,0.6)}, 0 0 30px ${hex2rgba(c,0.4)}, 0 0 60px ${hex2rgba(c,0.15)}`
    : active
      ? `0 0 0 1px ${hex2rgba(c,0.5)}, 0 0 14px ${hex2rgba(c,0.25)}`
      : `0 0 0 1px ${hex2rgba(c,0.15)}`;
  const icons = {
    surfer:    <path d="M10 36 Q20 12 30 22 Q40 32 50 14" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round"/>,
    inspector: <><circle cx="26" cy="26" r="11" stroke={c} strokeWidth="2" fill="none"/><line x1="34" y1="34" x2="46" y2="46" stroke={c} strokeWidth="2.5" strokeLinecap="round"/></>,
    artist:    <><path d="M14 40 Q18 18 32 16 Q46 14 46 28 Q46 42 32 44 Q22 45 14 40Z" stroke={c} strokeWidth="2" fill="none"/><circle cx="32" cy="28" r="4" fill={c} opacity="0.6"/></>,
    monk:      <><circle cx="32" cy="20" r="9" stroke={c} strokeWidth="2" fill="none"/><path d="M16 46 Q32 32 48 46" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/><line x1="32" y1="29" x2="32" y2="38" stroke={c} strokeWidth="1.5"/></>,
    general:   <><path d="M18 18 L32 10 L46 18 L46 38 L32 46 L18 38Z" stroke={c} strokeWidth="2" fill="none"/><line x1="32" y1="18" x2="32" y2="38" stroke={c} strokeWidth="1.5"/><line x1="22" y1="28" x2="42" y2="28" stroke={c} strokeWidth="1.5"/></>,
    dan:       <><path d="M18 14 L46 14 L46 38 L32 46 L18 38Z" stroke={c} strokeWidth="2" fill="none"/><path d="M24 28 L30 34 L40 22" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
  };
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`radial-gradient(circle at 35% 35%, ${hex2rgba(c,0.12)}, ${bg})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"box-shadow 0.4s ease", boxShadow:shadow }}>
      <svg width={size*.86} height={size*.86} viewBox="0 0 56 56">
        {icons[char.id] || <text x="28" y="34" textAnchor="middle" fontSize="24" fill={c}>{char.emoji}</text>}
      </svg>
    </div>
  );
};


const PORTRAIT_URLS = {
  dan:       "/characters/Dan.png",
  surfer:    "/characters/Maui.png",
  inspector: "/characters/Lamia.png",
  artist:    "/characters/Severn.png",
  monk:      "/characters/Hoyt.png",
  general:   "/characters/Morpurgo.png",
};
const CouncilSeats = ({ characters, activeSpeaker }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"clamp(10px,2.5vw,22px)", padding:"10px 0 8px", flexWrap:"wrap" }}>
    {[DAN, ...characters].map(c => {
      const isActive = activeSpeaker === c.id;
      return (
        <div key={c.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px",
          opacity:activeSpeaker && !isActive ? 0.3 : 1,
          transform:isActive ? "scale(1.12)" : "scale(1)",
          transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <div style={{
            width: isActive?"40px":"30px",
            height: isActive?"66px":"50px",
            borderRadius:"3px", overflow:"hidden",
            border:`1px solid ${isActive ? c.color+"80" : hex2rgba(c.color,0.15)}`,
            background:"#020200",
            transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: isActive ? `0 0 14px ${c.color}50, 0 0 30px ${c.color}20` : "none",
            position:"relative",
          }}>
            <img src={PORTRAIT_URLS[c.id]} alt={c.name}
              style={{ width:"100%", height:"100%", objectFit:"contain", objectPosition:"center bottom",
                filter:`brightness(${isActive?1:0.65})`, transition:"all 0.3s" }}
              onError={e=>{ e.target.style.display="none"; }}/>
            {isActive && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"40%",
              background:`linear-gradient(to top, ${c.color}30 0%, transparent 100%)` }}/>}
          </div>
          <span style={{ fontSize:"8px", color:isActive?c.color:"#4a4535", fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", transition:"color 0.3s" }}>{c.name}</span>
        </div>
      );
    })}
  </div>
);

const DanTypewriter = ({ text, onDone }) => {
  const { displayed, done } = useTypewriter(text, 16, true);
  useEffect(() => { if(done && onDone) onDone(); }, [done]);
  return <ParsedText text={displayed} fontSize="14px" color="#b8a882" serif={false} />;
};

const UserPromptInput = ({ onSubmit, t=UI.en }) => {
  const [val, setVal] = useState("");
  return (
    <div style={{ display:"flex", gap:"8px" }}>
      <input value={val} onChange={e=>setVal(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter"){onSubmit(val||"—");setVal("");}}}
        placeholder="…"
        style={{ flex:1,minWidth:0,background:"rgba(201,168,76,0.04)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"6px",color:"#d4c4a0",fontSize:"13px",padding:"8px 11px",outline:"none",fontFamily:"'Palatino Linotype',serif" }}
        onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.15)"}
      />
      <button onClick={()=>{onSubmit(val||"—");setVal("");}}
        style={{ background:"rgba(201,168,76,0.1)",color:"#c9a84c",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"6px",padding:"8px 14px",fontWeight:700,cursor:"pointer",fontSize:"12px" }}>→</button>
      <button onClick={()=>onSubmit("—")}
        style={{ background:"transparent",color:"rgba(201,168,76,0.3)",border:"1px solid rgba(201,168,76,0.08)",borderRadius:"6px",padding:"8px 12px",cursor:"pointer",fontSize:"11px" }}>Skip</button>
    </div>
  );
};

const DanBlock = ({ summary, question, userPrompt, councilQuestion, needsMoreRound, onAnswer, onUserPromptAnswer, answered, userAnswer, revealed, onReveal, t=UI.en }) => {
  const [ans, setAns] = useState("");
  const [vis, setVis] = useState(false);
  const showQ = needsMoreRound && question && !answered;
  useEffect(() => { const timer = setTimeout(() => setVis(true), 60); return () => clearTimeout(timer); }, []);

  if(!revealed) return (
    <div style={{ opacity:vis?1:0, transition:"opacity 0.4s", margin:"20px 0", display:"flex", justifyContent:"center" }}>
      <button onClick={onReveal} style={{
        display:"flex", alignItems:"center", gap:"9px",
        background:"transparent", border:"1px solid rgba(201,168,76,0.2)",
        borderRadius:"24px", padding:"8px 20px", cursor:"pointer",
        color:"rgba(201,168,76,0.55)", fontSize:"12px", fontWeight:600,
        letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif",
        transition:"all 0.2s",
      }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(201,168,76,0.5)"; e.currentTarget.style.color="#c9a84c"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(201,168,76,0.2)"; e.currentTarget.style.color="rgba(201,168,76,0.55)"; }}
      >
        <Avatar char={DAN} size={18} /> {t.danSpeaks}
      </button>
    </div>
  );

  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(10px)", transition:"all 0.4s ease", margin:"24px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.25))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={30} active />
          <span style={{ color:"#c9a84c", fontWeight:700, fontSize:"10px", letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif", whiteSpace:"nowrap" }}>{t.danJudge}</span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.25))" }}/>
      </div>
      <div style={{ background:"linear-gradient(160deg,rgba(13,10,2,0.95),rgba(8,6,0,0.98))", border:"1px solid rgba(201,168,76,0.14)", borderRadius:"12px", padding:"16px 20px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:"20%",right:"20%",height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.3),transparent)" }}/>
        {councilQuestion && !answered && (
          <div style={{ background:"rgba(201,168,76,0.04)", borderRadius:"8px", padding:"10px 14px", marginBottom:"12px", border:"1px solid rgba(201,168,76,0.1)" }}>
            <span style={{ fontSize:"10px", color:"rgba(201,168,76,0.45)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Dan asks {councilQuestion.to} →</span>
            <p style={{ color:"#b8a882", fontSize:"13px", lineHeight:"1.55", margin:"5px 0 0", fontFamily:"'Palatino Linotype',serif" }}>{councilQuestion.question}</p>
          </div>
        )}
        {userPrompt && !needsMoreRound && !answered && (
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.08)", paddingTop:"12px", marginTop:"4px" }}>
            <p style={{ color:"#c9a84c", fontSize:"13px", lineHeight:"1.55", marginBottom:"10px", fontFamily:"'Palatino Linotype',serif", opacity:0.8 }}>{userPrompt}</p>
            <UserPromptInput onSubmit={onUserPromptAnswer} t={t} />
          </div>
        )}
        {showQ && (
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.08)", paddingTop:"14px" }}>
            <p style={{ color:"#d4c4a0", fontSize:"14px", marginBottom:"12px", lineHeight:"1.55", fontFamily:"'Palatino Linotype',serif" }}>{question}</p>
            <div style={{ display:"flex", gap:"8px" }}>
              <input value={ans} onChange={e=>setAns(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&ans.trim()){onAnswer(ans);setAns("");}}}
                placeholder={t.speakTruth}
                style={{ flex:1,minWidth:0,background:"rgba(201,168,76,0.04)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"6px",color:"#d4c4a0",fontSize:"14px",padding:"9px 12px",outline:"none",fontFamily:"'Palatino Linotype',serif" }}
                onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.15)"}
              />
              <button onClick={()=>{if(ans.trim()){onAnswer(ans);setAns("");}}}
                style={{ background:"rgba(201,168,76,0.15)",color:"#c9a84c",border:"1px solid rgba(201,168,76,0.3)",borderRadius:"6px",padding:"9px 16px",fontWeight:700,cursor:"pointer",fontSize:"13px" }}>→</button>
            </div>
          </div>
        )}
        {answered&&question&&(
          <div style={{ borderTop:"1px solid rgba(201,168,76,0.06)", paddingTop:"9px" }}>
            <p style={{ color:"#3a3020",fontSize:"11px" }}>✓ {question}</p>
            <p style={{ color:"#4a4030",fontSize:"12px",marginTop:"3px",fontStyle:"italic" }}>↩ {userAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const OpeningBlock = ({ text, t=UI.en }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setVis(true), 200); return () => clearTimeout(timer); }, []);
  return (
    <div style={{ opacity:vis?1:0, transition:"opacity 0.6s", margin:"20px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.25))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={30} active />
          <span style={{ color:"#c9a84c", fontWeight:700, fontSize:"10px", letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif", whiteSpace:"nowrap" }}>{t.danJudge}</span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.25))" }}/>
      </div>
      <div style={{ background:"linear-gradient(160deg,rgba(13,10,2,0.95),rgba(8,6,0,0.98))", border:"1px solid rgba(201,168,76,0.18)", borderRadius:"12px", padding:"18px 22px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:"20%",right:"20%",height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.4),transparent)" }}/>
        <DanTypewriter text={text} />
      </div>
    </div>
  );
};

const ContextBlock = ({ questions, onSubmit, t=UI.en }) => {
  const [answers, setAnswers] = useState({});
  const [vis, setVis] = useState(false);
  const allAnswered = questions.every((_,i) => answers[i]?.trim());
  useEffect(() => { const timer = setTimeout(() => setVis(true), 100); return () => clearTimeout(timer); }, []);
  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(10px)", transition:"all 0.4s", margin:"20px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.25))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={30} active />
          <span style={{ color:"#c9a84c", fontWeight:700, fontSize:"10px", letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif", whiteSpace:"nowrap" }}>{t.danJudge}</span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.25))" }}/>
      </div>
      <div style={{ background:"linear-gradient(160deg,rgba(13,10,2,0.95),rgba(8,6,0,0.98))", border:"1px solid rgba(201,168,76,0.18)", borderRadius:"12px", padding:"18px 22px", position:"relative" }}>
        <div style={{ position:"absolute",top:0,left:"20%",right:"20%",height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.4),transparent)" }}/>
        <p style={{ color:"#6a5c3a", fontSize:"12px", marginBottom:"18px", fontStyle:"italic", fontFamily:"'Palatino Linotype',serif" }}>{t.beforeConvenes}</p>
        {questions.map((q,i) => (
          <div key={i} style={{ marginBottom:"16px" }}>
            <p style={{ color:"#d4c4a0", fontSize:"14px", marginBottom:"9px", lineHeight:"1.5", fontFamily:"'Palatino Linotype',serif" }}>{q}</p>
            <input value={answers[i]||""} onChange={e=>setAnswers(p=>({...p,[i]:e.target.value}))}
              onKeyDown={e=>{if(e.key==="Enter"&&allAnswered)onSubmit(questions.map((_,j)=>answers[j]||""));}}
              placeholder={t.speakTruth}
              style={{ width:"100%",background:"rgba(201,168,76,0.04)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"6px",color:"#d4c4a0",fontSize:"14px",padding:"10px 13px",outline:"none",fontFamily:"'Palatino Linotype',serif",boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.15)"}
            />
          </div>
        ))}
        <button onClick={()=>allAnswered&&onSubmit(questions.map((_,i)=>answers[i]||""))} disabled={!allAnswered}
          style={{ background:allAnswered?"rgba(201,168,76,0.12)":"transparent", color:allAnswered?"#c9a84c":"#3a3020", border:`1px solid ${allAnswered?"rgba(201,168,76,0.3)":"rgba(201,168,76,0.06)"}`, borderRadius:"6px", padding:"10px 22px", fontWeight:700, cursor:allAnswered?"pointer":"not-allowed", fontSize:"13px", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif" }}>
          {t.conveneCouncil}
        </button>
      </div>
    </div>
  );
};

const RoundHeader = ({ label }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"28px 0 20px" }}>
    <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.12))" }}/>
    <span style={{ fontSize:"9px", color:"rgba(201,168,76,0.35)", fontWeight:800, letterSpacing:"0.2em", textTransform:"uppercase", padding:"4px 14px", border:"1px solid rgba(201,168,76,0.08)", borderRadius:"20px", fontFamily:"'Palatino Linotype',serif" }}>{label}</span>
    <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.12))" }}/>
  </div>
);

const AgentTurn = ({ turn, slideDir="left", respondingToDan=false, t=UI.en }) => {
  const [vis, setVis] = useState(false);
  const [exp, setExp] = useState(false);
  const isLeft = slideDir === "left";
  const long = turn.text.length > 300;
  const displayText = exp||!long ? turn.text : turn.text.slice(0,300)+"…";
  useEffect(() => { const timer = setTimeout(() => setVis(true), 50); return () => clearTimeout(timer); }, []);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:isLeft?"flex-start":"flex-end", marginBottom:"18px",
      opacity:vis?1:0, transform:vis?"translateX(0)":`translateX(${isLeft?"-44px":"44px"})`,
      transition:"all 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
      {respondingToDan && (
        <div style={{ fontSize:"9px", color:"rgba(201,168,76,0.35)", marginBottom:"4px", [isLeft?"marginLeft":"marginRight"]:"52px", letterSpacing:"0.08em", textTransform:"uppercase" }}>{t.respondingToDan}</div>
      )}
      <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", flexDirection:isLeft?"row":"row-reverse", maxWidth:"92%" }}>
        <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
          <div style={{ width:"52px", height:"88px", borderRadius:"4px", overflow:"hidden",
            border:`1px solid ${hex2rgba(turn.color,0.35)}`,
            background:"#020200",
            boxShadow:`0 0 16px ${hex2rgba(turn.color,0.2)}, 0 4px 12px rgba(0,0,0,0.5)`,
            position:"relative",
          }}>
            <img src={PORTRAIT_URLS[turn.id]} alt={turn.name}
              style={{ width:"100%", height:"100%", objectFit:"contain", objectPosition:"center bottom",
                filter:`brightness(0.92) drop-shadow(0 2px 6px rgba(0,0,0,0.6))` }}
              onError={e=>{
                e.target.style.display="none";
                e.target.parentElement.style.display="flex";
                e.target.parentElement.style.alignItems="center";
                e.target.parentElement.style.justifyContent="center";
              }}/>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"35%",
              background:`linear-gradient(to top, ${hex2rgba(turn.color,0.25)} 0%, transparent 100%)` }}/>
          </div>
        </div>
        <div style={{
          background:`linear-gradient(150deg,${hex2rgba(turn.color,0.07)},${hex2rgba(turn.color,0.03)})`,
          border:`1px solid ${hex2rgba(turn.color,0.2)}`,
          borderRadius:isLeft?"3px 14px 14px 14px":"14px 3px 14px 14px",
          padding:"14px 18px", position:"relative",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px", flexWrap:"wrap" }}>
            <span style={{ color:turn.color, fontWeight:800, fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif" }}>{turn.name}</span>
            <span style={{ color:hex2rgba(turn.color,0.4), fontSize:"10px", fontStyle:"italic" }}>{turn.title}</span>
            {turn.position_updated && <span style={{ fontSize:"9px", background:hex2rgba(turn.color,0.12), color:turn.color, borderRadius:"4px", padding:"2px 6px", fontWeight:700 }}>↻ {t.stanceShifted}</span>}
            {long && <button onClick={()=>setExp(!exp)} style={{ marginLeft:"auto", fontSize:"10px", color:"#4a4030", background:"transparent", border:"none", cursor:"pointer" }}>{exp ? t.collapse : t.expand}</button>}
          </div>
          <ParsedText text={displayText} fontSize="15px" color="#c8b99a" />
        </div>
      </div>
    </div>
  );
};

const SpeakerPicker = ({ pitches, onChoose, loading, t=UI.en, onRetry }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setVis(true), 80); return () => clearTimeout(timer); }, []);
  const allFailed = pitches.every(p => p.pitch === "...");
  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(10px)", transition:"all 0.35s ease", margin:"18px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.12))" }}/>
        <span style={{ fontSize:"9px", color:"rgba(201,168,76,0.35)", fontWeight:800, letterSpacing:"0.16em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif" }}>{t.whoSpeaks}</span>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.12))" }}/>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
        {pitches.map((p, i) => (
          <button key={p.character_id} onClick={() => !loading && onChoose(p.character_id)}
            disabled={loading}
            style={{ display:"flex", alignItems:"center", gap:"12px",
              background:"rgba(201,168,76,0.02)", border:`1px solid ${hex2rgba(p.char.color,0.18)}`,
              borderRadius:"10px", padding:"12px 15px", cursor:loading?"not-allowed":"pointer",
              textAlign:"left", transition:"all 0.18s", opacity:loading?0.5:1,
              animation:`fadeSlideIn 0.3s ease ${i*0.06}s both`,
            }}
            onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.background=hex2rgba(p.char.color,0.07); e.currentTarget.style.borderColor=hex2rgba(p.char.color,0.45); }}}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(201,168,76,0.02)"; e.currentTarget.style.borderColor=hex2rgba(p.char.color,0.18); }}
          >
            <Avatar char={p.char} size={34} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"10px", color:p.char.color, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"4px", fontFamily:"'Palatino Linotype',serif" }}>{p.char.name}</div>
              <ParsedText text={p.pitch} fontSize="13px" color="#7a6a4a" serif={false} />
            </div>
            <span style={{ color:"rgba(201,168,76,0.25)", fontSize:"14px" }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const DebateClosedBanner = ({ onReveal, revealed, t=UI.en }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setVis(true), 200); return () => clearTimeout(timer); }, []);
  if(revealed) return null;
  return (
    <div style={{ opacity:vis?1:0, transform:vis?"scale(1)":"scale(0.97)", transition:"all 0.5s cubic-bezier(0.16,1,0.3,1)", margin:"30px 0", textAlign:"center" }}>
      <div style={{ background:"linear-gradient(160deg,rgba(13,10,2,0.97),rgba(5,4,0,0.99))", border:"1px solid rgba(201,168,76,0.2)", borderRadius:"16px", padding:"30px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.5),transparent)" }}/>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.3),transparent)" }}/>
        <div style={{ fontSize:"32px", marginBottom:"14px", opacity:0.8 }}>⚖️</div>
        <p style={{ color:"rgba(201,168,76,0.6)", fontWeight:700, fontSize:"11px", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"8px", fontFamily:"'Palatino Linotype',serif" }}>{t.theCouncilSpoke}</p>
        <p style={{ color:"#4a3e28", fontSize:"13px", lineHeight:"1.6", marginBottom:"22px", fontFamily:"'Palatino Linotype',serif", fontStyle:"italic" }}>{t.danReady}</p>
        <button onClick={onReveal} style={{ background:"rgba(201,168,76,0.1)", color:"#c9a84c", border:"1px solid rgba(201,168,76,0.35)", borderRadius:"8px", padding:"11px 28px", fontSize:"13px", fontWeight:700, cursor:"pointer", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif", transition:"all 0.2s" }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(201,168,76,0.18)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="rgba(201,168,76,0.1)"; }}
        >{t.hearVerdict}</button>
      </div>
    </div>
  );
};

const VerdictBlock = ({ verdict, t=UI.en }) => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setVis(true), 100); return () => clearTimeout(timer); }, []);
  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(16px)", transition:"all 0.6s cubic-bezier(0.16,1,0.3,1)", margin:"8px 0 28px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.3))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <Avatar char={DAN} size={36} active glow />
          <span style={{ color:"#c9a84c", fontWeight:700, fontSize:"10px", letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif" }}>{t.dansJudgment}</span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.3))" }}/>
      </div>
      <div style={{ background:"linear-gradient(160deg,rgba(13,10,2,0.98),rgba(5,4,0,0.99))", border:"1px solid rgba(201,168,76,0.2)", borderRadius:"16px", padding:"22px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.5),transparent)" }}/>
        {verdict.insights?.length>0 && (
          <div style={{ marginBottom:"20px" }}>
            <div style={{ fontSize:"9px",color:"rgba(201,168,76,0.35)",fontWeight:800,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:"12px",fontFamily:"'Palatino Linotype',serif" }}>{t.whatEstablished}</div>
            {verdict.insights.map((b,i) => (
              <div key={i} style={{ display:"flex",gap:"10px",marginBottom:"10px",alignItems:"baseline" }}>
                <span style={{ color:"rgba(201,168,76,0.3)",flexShrink:0,fontSize:"8px" }}>◆</span>
                <ParsedText text={b} fontSize="13px" color="#8a7a5a" serif={false}/>
              </div>
            ))}
          </div>
        )}
        {(verdict.for_points?.length>0||verdict.against_points?.length>0) && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"12px",marginBottom:"20px" }}>
            {verdict.for_points?.length>0 && (
              <div style={{ background:"rgba(74,222,128,0.04)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:"10px",padding:"14px 16px" }}>
                <div style={{ fontSize:"9px",color:"rgba(74,222,128,0.6)",fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"10px",fontFamily:"'Palatino Linotype',serif" }}>{t.for}</div>
                {verdict.for_points.map((p,i)=>(
                  <div key={i} style={{ display:"flex",gap:"8px",marginBottom:"9px",alignItems:"baseline" }}>
                    <span style={{ color:"rgba(74,222,128,0.5)",flexShrink:0,fontSize:"12px" }}>+</span>
                    <ParsedText text={p} fontSize="13px" color="#8a9a88" serif={false}/>
                  </div>
                ))}
              </div>
            )}
            {verdict.against_points?.length>0 && (
              <div style={{ background:"rgba(251,146,60,0.04)",border:"1px solid rgba(251,146,60,0.15)",borderRadius:"10px",padding:"14px 16px" }}>
                <div style={{ fontSize:"9px",color:"rgba(251,146,60,0.6)",fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:"10px",fontFamily:"'Palatino Linotype',serif" }}>{t.against}</div>
                {verdict.against_points.map((p,i)=>(
                  <div key={i} style={{ display:"flex",gap:"8px",marginBottom:"9px",alignItems:"baseline" }}>
                    <span style={{ color:"rgba(251,146,60,0.5)",flexShrink:0,fontSize:"12px" }}>−</span>
                    <ParsedText text={p} fontSize="13px" color="#9a8878" serif={false}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {verdict.recommendation && (
          <div style={{ background:"rgba(0,0,0,0.4)",borderRadius:"10px",padding:"18px 20px",border:"1px solid rgba(201,168,76,0.2)",position:"relative" }}>
            <div style={{ position:"absolute",top:0,left:"10%",right:"10%",height:"1px",background:"linear-gradient(to right,transparent,rgba(201,168,76,0.3),transparent)" }}/>
            <div style={{ fontSize:"9px",color:"rgba(201,168,76,0.45)",fontWeight:800,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:"12px",fontFamily:"'Palatino Linotype',serif" }}>🎯 {t.theJudgment}</div>
            <ParsedText text={verdict.recommendation} fontSize="16px" color="#e8d8b0" />
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingPulse = ({ label, speaker }) => (
  <div style={{ display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",opacity:0.6 }}>
    {speaker && <Avatar char={speaker} size={26} active/>}
    <div style={{ display:"flex",gap:"4px" }}>
      {[0,1,2].map(i=>(
        <div key={i} style={{ width:"5px",height:"5px",borderRadius:"50%",background:speaker?speaker.color:"#c9a84c",animation:"pulse 1.2s ease-in-out infinite",animationDelay:`${i*0.2}s` }}/>
      ))}
    </div>
    {label && <span style={{ color:"#3a3020",fontSize:"12px",fontStyle:"italic",fontFamily:"'Palatino Linotype',serif" }}>{label}</span>}
  </div>
);

const QuestionBubble = ({ text }) => (
  <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:"22px" }}>
    <div style={{ background:"rgba(201,168,76,0.05)",border:"1px solid rgba(201,168,76,0.15)",borderRadius:"14px 14px 3px 14px",padding:"13px 18px",maxWidth:"80%" }}>
      <ParsedText text={text} fontSize="16px" color="#d4c4a0"/>
    </div>
  </div>
);

// ── Landing Page ──────────────────────────────────────────────

const COUNCIL_DATA = [
  { id:"dan",      name:"Dan",      title:"The Judge",     color:"#c9a84c", lens:"Judgment & Clarity",    description:"Dan has presided over ten thousand decisions. He opens the debate, interrogates the council, and delivers the final verdict. Calm. Sharp. No agenda. His only goal is your clarity.", tagline:"I have presided over ten thousand decisions. Bring me yours." },
  { id:"surfer",    name:"Maui",     title:"The Surfer",    color:"#38bdf8", lens:"Risk & Instinct",        description:"Maui has built and lost companies, ridden waves that crushed others. He reads risk the way a surfer reads the ocean — not from charts, but from feel. He knows when to paddle hard and when to pull back.",           tagline:"The wave is forming. Will you paddle?" },
  { id:"inspector", name:"Lamia",    title:"The Inspector", color:"#e879f9", lens:"Evidence & Detail",       description:"A decade in forensic analysis finding why decisions fail — not in theory, but in autopsy. Cold. Precise. She finds the variable everyone missed, the number nobody checked, the pattern hiding in plain sight.",      tagline:"The truth is in what no one examined." },
  { id:"artist",    name:"Severn",   title:"The Artist",    color:"#fb923c", lens:"Creativity & Freedom",    description:"Severn walked away from two secure careers. Both times people said he was crazy. Both times he was right. He challenges the premise of every question — because the real question is almost never the one being asked.", tagline:"The question itself may be the trap." },
  { id:"monk",      name:"Hoyt",     title:"The Monk",      color:"#4ade80", lens:"Long-term Meaning",       description:"Hoyt has watched thousands of decisions play out over decades — in real lives, with real consequences. Warm but precise. He measures everything against the 10-year arc. He illuminates where the road leads.",        tagline:"In ten years, which choice will you mourn?" },
  { id:"general",   name:"Morpurgo", title:"The General",   color:"#facc15", lens:"Strategy & Consequences", description:"Thirty years in command where mistakes cost lives. Morpurgo sees everything as a campaign: objectives, terrain, failure modes, contingencies. Blunt. Zero tolerance for wishful thinking.",                          tagline:"Plans fail. Contingencies don't." },
];

const RUNES = ["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ","ᚺ","ᚾ","ᛁ","ᛃ","ᛇ","ᛈ","ᛉ","ᛊ","ᛏ","ᛒ","ᛖ","ᛗ","ᛚ","ᛜ","ᛞ","ᛟ"];

const Particles = () => {
  // Distribute runes deliberately to edges, not centre
  const edgeXPositions = [2,5,8,92,95,88,4,96,11,89,6,94,3,97,7,91];
  const particles = Array.from({length:36}, (_,i) => {
    const isRune = i%3===0;
    const runeIdx = Math.floor(i/3);
    // Runes: place along left edge (x 2-12) or right edge (x 88-98), full height
    const x = isRune
      ? (runeIdx%2===0 ? 2+(runeIdx*3.1)%10 : 88+(runeIdx*2.7)%10)
      : (i*37+11)%100;
    return {
      id:i,
      x,
      y: (i*53+7)%100,
      size: (i%3)+0.8,
      delay: (i*1.1)%12,
      duration: 12+(i%8),
      opacity: isRune ? 0.09+(i%4)*0.02 : 0.055+(i%5)*0.022,
      isRune,
      rune: RUNES[i%RUNES.length],
    };
  });

  const fogLayers = [
    { y:"20%", dur:22, delay:0,   opacity:0.018 },
    { y:"45%", dur:28, delay:6,   opacity:0.022 },
    { y:"70%", dur:18, delay:12,  opacity:0.016 },
  ];

  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:1, overflow:"hidden" }}>
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 0.6; }
          100% { transform: translateY(-140px) translateX(15px); opacity: 0; }
        }
        @keyframes floatRune {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(-180px) rotate(25deg); opacity: 0; }
        }
        @keyframes fogDrift {
          0%   { transform: translateX(-8%) scaleY(1); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(8%) scaleY(1.04); opacity: 0; }
        }
        @keyframes revealChar {
          0%   { opacity: 0; transform: translateY(24px) scale(0.96); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes titleReveal {
          0%   { opacity: 0; letter-spacing: 0.5em; filter: blur(8px); }
          100% { opacity: 1; letter-spacing: 0.25em; filter: blur(0); }
        }
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(201,168,76,0.1), inset 0 0 20px rgba(201,168,76,0.02); }
          50%       { box-shadow: 0 0 50px rgba(201,168,76,0.22), inset 0 0 30px rgba(201,168,76,0.06); }
        }
        @keyframes lineDraw {
          0%   { width: 0; opacity: 0; }
          100% { width: 80px; opacity: 1; }
        }
        @keyframes orb {
          0%, 100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.05; }
          50%       { transform: translate(-50%,-50%) scale(1.12); opacity: 0.10; }
        }
        @keyframes orbPulse2 {
          0%, 100% { transform: translate(-50%,-50%) scale(1);    opacity: 0.03; }
          50%       { transform: translate(-50%,-50%) scale(0.88); opacity: 0.07; }
        }
        @keyframes spotlightReveal {
          0%   { opacity: 0; transform: scale(0.85); filter: blur(12px); }
          100% { opacity: 1; transform: scale(1);    filter: blur(0); }
        }
        @keyframes spotlightExit {
          0%   { opacity: 1; }
          100% { opacity: 0.12; filter: blur(2px); }
        }
      `}</style>

      {/* Fog layers */}
      {fogLayers.map((f,i) => (
        <div key={"fog"+i} style={{
          position:"absolute", left:"-10%", top:f.y,
          width:"120%", height:"180px",
          background:"radial-gradient(ellipse 80% 50% at 50% 50%, rgba(201,168,76,0.03) 0%, transparent 70%)",
          animation:`fogDrift ${f.dur}s ease-in-out ${f.delay}s infinite alternate`,
          opacity:f.opacity,
        }}/>
      ))}

      {/* Particles + runes */}
      {particles.map(p => p.isRune ? (
        <div key={p.id} style={{
          position:"absolute",
          left:`${p.x}%`, top:`${p.y}%`,
          fontSize:`${p.size*4+10}px`,
          color:"rgba(201,168,76,0.65)",
          fontFamily:"serif",
          animation:`floatRune ${p.duration+4}s ease-in-out ${p.delay}s infinite`,
          opacity:p.opacity,
          userSelect:"none",
          letterSpacing:"0.1em",
        }}>{p.rune}</div>
      ) : (
        <div key={p.id} style={{
          position:"absolute",
          left:`${p.x}%`, top:`${p.y}%`,
          width:`${p.size}px`, height:`${p.size}px`,
          background:`radial-gradient(circle, rgba(220,180,80,0.9) 0%, rgba(201,168,76,0.3) 100%)`,
          borderRadius:"50%",
          boxShadow:`0 0 ${p.size*3}px rgba(201,168,76,0.4)`,
          animation:`floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`,
          opacity:p.opacity,
        }}/>
      ))}
    </div>
  );
};

const LandingPage = ({ onEnter }) => {
  const [phase, setPhase] = useState(-1);
  const [activeChar, setActiveChar] = useState(null);
  const [charsRevealed, setCharsRevealed] = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setPhase(0), 100);
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setPhase(3), 3000);
    const t4 = setTimeout(() => setPhase(4), 4200);
    const t5 = setTimeout(() => { setPhase(5); setCharsRevealed(true); }, 5000);
    const t6 = setTimeout(() => setPhase(6), 5000 + COUNCIL_DATA.length * 180 + 600);
    return () => [t0,t1,t2,t3,t4,t5,t6].forEach(clearTimeout);
  }, []);

  const active = activeChar !== null ? COUNCIL_DATA[activeChar] : null;

  return (
    <div style={{
      minHeight:"100vh", background:"#020200",
      fontFamily:"'Palatino Linotype','Palatino','Book Antiqua',serif",
      position:"relative", overflow:"hidden",
      display:"flex", flexDirection:"column", alignItems:"center",
    }}>
      <Particles />
      <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.85) 100%)", pointerEvents:"none", zIndex:2 }}/>
      <div style={{ position:"fixed", top:"38%", left:"50%", width:"min(800px,100vw)", height:"min(800px,100vw)", pointerEvents:"none", zIndex:1, animation:"orb 8s ease-in-out infinite", background:"radial-gradient(circle, rgba(201,168,76,0.07) 0%, rgba(120,60,180,0.015) 40%, transparent 65%)", transform:"translate(-50%,-50%)" }}/>
      <div style={{ position:"fixed", top:"55%", left:"30%", width:"min(500px,70vw)", height:"min(500px,70vw)", pointerEvents:"none", zIndex:1, animation:"orbPulse2 12s ease-in-out 3s infinite", background:"radial-gradient(circle, rgba(120,60,200,0.04) 0%, transparent 60%)", transform:"translate(-50%,-50%)" }}/>
      <div style={{ position:"fixed", top:"25%", left:"70%", width:"min(400px,60vw)", height:"min(400px,60vw)", pointerEvents:"none", zIndex:1, animation:"orbPulse2 15s ease-in-out 7s infinite", background:"radial-gradient(circle, rgba(60,100,200,0.03) 0%, transparent 60%)", transform:"translate(-50%,-50%)" }}/>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:2, background:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)" }}/>
      <div style={{ position:"fixed", top:"12%", left:0, right:0, height:"1px", background:"linear-gradient(to right,transparent 0%,rgba(201,168,76,0.08) 30%,rgba(201,168,76,0.08) 70%,transparent 100%)", pointerEvents:"none", zIndex:3, opacity:phase>=2?1:0, transition:"opacity 2s ease" }}/>
      <div style={{ position:"fixed", bottom:"8%", left:0, right:0, height:"1px", background:"linear-gradient(to right,transparent 0%,rgba(201,168,76,0.08) 30%,rgba(201,168,76,0.08) 70%,transparent 100%)", pointerEvents:"none", zIndex:3, opacity:phase>=2?1:0, transition:"opacity 2s ease" }}/>

      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:"1100px", padding:"clamp(40px,8vw,80px) clamp(16px,4vw,40px)", display:"flex", flexDirection:"column", alignItems:"center" }}>

        <div style={{ fontSize:"clamp(32px,5vw,52px)", marginBottom:"clamp(16px,3vw,24px)", opacity:phase>=1?0.65:0, transform:phase>=1?"scale(1) translateY(0)":"scale(0.7) translateY(10px)", transition:"all 1.6s cubic-bezier(0.16,1,0.3,1)", filter:phase>=1?"drop-shadow(0 0 30px rgba(201,168,76,0.5))":"none" }}>⚖️</div>

        <h1 style={{ fontSize:"clamp(28px,5.5vw,64px)", fontWeight:400, color:"#c9a84c", textTransform:"uppercase", margin:"0 0 clamp(6px,1.5vw,12px)", textShadow:"0 0 80px rgba(201,168,76,0.25), 0 2px 8px rgba(0,0,0,0.9)", opacity:phase>=2?1:0, animation:phase>=2?"titleReveal 1.4s cubic-bezier(0.16,1,0.3,1) forwards":"none", letterSpacing:"0.25em" }}>The Council</h1>

        {phase>=3 && (
          <div style={{ height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.7),transparent)", margin:"clamp(10px,2vw,18px) auto", animation:"lineDraw 1.2s ease forwards", width:0 }}/>
        )}

        <p style={{ fontSize:"clamp(12px,2vw,18px)", color:"rgba(201,168,76,0.38)", fontStyle:"italic", letterSpacing:"0.08em", lineHeight:1.8, maxWidth:"500px", textAlign:"center", opacity:phase>=3?1:0, animation:phase>=3?"fadeUp 1s ease 0.3s forwards":"none", marginBottom:"clamp(28px,5vw,52px)" }}>
          Five minds. One question. No comfortable answers.
        </p>

        {phase>=4 && (
          <div style={{ textAlign:"center", marginBottom:"clamp(20px,3.5vw,32px)", animation:"fadeUp 0.8s ease forwards", opacity:0 }}>
            <p style={{ fontSize:"clamp(8px,1.1vw,11px)", letterSpacing:"0.3em", color:"rgba(201,168,76,0.2)", textTransform:"uppercase" }}>
              — The Council —
            </p>
          </div>
        )}

        {phase>=5 && (
          <div style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center", gap:"clamp(16px,3vw,28px)" }}>

            {(() => {
              const dan = COUNCIL_DATA.find(m => m.id==="dan");
              const danIdx = COUNCIL_DATA.indexOf(dan);
              const isDanActive = activeChar === danIdx;
              return dan ? (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:"clamp(16px,3vw,28px)" }}>
                  <div onClick={() => setActiveChar(isDanActive ? null : danIdx)} style={{ cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:"10px", animation:"revealChar 0.7s cubic-bezier(0.16,1,0.3,1) 0ms forwards", opacity:0 }}>
                    <div style={{ position:"relative", width:"clamp(130px,16vw,200px)", height:"clamp(240px,32vw,380px)", borderRadius:"4px", overflow:"hidden", border:"none", background:"transparent", transition:"all 0.4s ease", boxShadow:isDanActive ? `0 0 80px ${dan.color}35, 0 0 160px ${dan.color}12` : "none", transform:isDanActive?"scale(1.05)":"scale(1)" }}>
                      <img src={PORTRAIT_URLS["dan"]} alt="Dan" style={{ width:"100%", height:"100%", objectFit:"contain", objectPosition:"center bottom", filter:`brightness(${isDanActive?1:0.88}) drop-shadow(0 8px 20px rgba(0,0,0,0.5))`, transition:"all 0.5s ease" }} onError={e=>{e.target.style.display="none"}}/>
                      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"30%", background:`linear-gradient(to top, ${dan.color}15 0%, transparent 100%)`, opacity:isDanActive?1:0.5, transition:"opacity 0.4s" }}/>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:"clamp(13px,1.8vw,17px)", fontWeight:700, color:isDanActive?dan.color:"rgba(201,168,76,0.8)", letterSpacing:"0.14em", textTransform:"uppercase", transition:"color 0.3s", textShadow:`0 0 ${isDanActive?30:15}px rgba(201,168,76,0.4)` }}>Dan</div>
                      <div style={{ fontSize:"clamp(8px,1vw,10px)", color:"rgba(201,168,76,0.3)", letterSpacing:"0.15em", textTransform:"uppercase", marginTop:"2px" }}>The Judge</div>
                      <div style={{ fontSize:"8px", color:"rgba(201,168,76,0.4)", letterSpacing:"0.12em", textTransform:"uppercase", marginTop:"4px", fontStyle:"italic" }}>always present</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px", marginTop:"clamp(14px,2.5vw,22px)", width:"clamp(200px,40vw,360px)" }}>
                    <div style={{ flex:1, height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.15))" }}/>
                    <span style={{ fontSize:"8px", color:"rgba(201,168,76,0.2)", letterSpacing:"0.2em", textTransform:"uppercase" }}>The Council</span>
                    <div style={{ flex:1, height:"1px", background:"linear-gradient(to left,transparent,rgba(201,168,76,0.15))" }}/>
                  </div>
                </div>
              ) : null;
            })()}

            {/* ── Five council members + spotlight overlay ── */}
            <div style={{ position:"relative", width:"100%", display:"flex", flexDirection:"column", alignItems:"center" }}>

              {/* Background row — dims/blurs when one is active */}
              <div style={{ display:"flex", justifyContent:"center", gap:"clamp(8px,1.8vw,20px)", flexWrap:"wrap", transition:"all 0.5s ease" }}>
                {COUNCIL_DATA.filter(m => m.id !== "dan").map((m, i) => {
                  const realIdx = COUNCIL_DATA.indexOf(m);
                  const isActive = activeChar === realIdx;
                  const anyActive = activeChar !== null;
                  return (
                    <div key={m.id} onClick={() => setActiveChar(isActive ? null : realIdx)}
                      style={{ cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px",
                        animation:`revealChar 0.7s cubic-bezier(0.16,1,0.3,1) ${(i+1)*180}ms forwards`, opacity:0,
                        transition:"all 0.55s cubic-bezier(0.16,1,0.3,1)",
                        transform: anyActive && !isActive ? "scale(0.82) translateY(8px)" : "scale(1)",
                        filter: anyActive && !isActive ? "blur(2px) brightness(0.35)" : "none",
                        pointerEvents: anyActive && !isActive ? "none" : "auto",
                      }}>
                      <div style={{ position:"relative", width:"clamp(90px,10vw,140px)", height:"clamp(180px,22vw,300px)",
                        borderRadius:"4px", overflow:"hidden", background:"transparent",
                        transition:"all 0.5s ease",
                        boxShadow: isActive ? `0 0 60px ${m.color}35, 0 0 120px ${m.color}12` : "none",
                        transform: isActive ? "scale(1.08)" : "scale(1)",
                      }}>
                        <img src={PORTRAIT_URLS[m.id]} alt={m.name}
                          style={{ width:"100%", height:"100%", objectFit:"contain", objectPosition:"center bottom",
                            filter:`brightness(${isActive?1:anyActive?0.5:0.85})`,
                            transition:"all 0.5s ease" }}
                          onError={e=>{e.target.style.display="none"}}/>
                        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"35%",
                          background:`linear-gradient(to top, ${m.color}22 0%, transparent 100%)`,
                          opacity:isActive?1:0.3, transition:"opacity 0.5s" }}/>
                      </div>
                      <div style={{ textAlign:"center", transition:"all 0.4s" }}>
                        <div style={{ fontSize:"clamp(13px,1.5vw,17px)", fontWeight:700,
                          color: isActive ? m.color : anyActive ? "rgba(201,168,76,0.3)" : "#d4b86a",
                          letterSpacing:"0.12em", textTransform:"uppercase", transition:"all 0.4s",
                          textShadow: isActive ? `0 0 24px ${m.color}, 0 0 8px ${m.color}80` : "0 0 10px rgba(201,168,76,0.15)" }}>{m.name}</div>
                        <div style={{ fontSize:"clamp(8px,0.9vw,10px)", color:"rgba(201,168,76,0.42)", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:"3px", fontStyle:"italic" }}>{m.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── SPOTLIGHT OVERLAY ── */}
              {active && active.id !== "dan" && (
                <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center",
                  background:"rgba(2,2,0,0.75)", backdropFilter:"blur(6px)",
                  animation:"fadeUp 0.3s ease forwards",
                }}
                  onClick={() => setActiveChar(null)}
                >
                  {/* Spotlight glow behind character */}
                  <div style={{ position:"absolute", width:"500px", height:"500px",
                    background:`radial-gradient(circle, ${active.color}18 0%, ${active.color}06 40%, transparent 70%)`,
                    borderRadius:"50%", pointerEvents:"none",
                    animation:"orb 5s ease-in-out infinite",
                    top:"50%", left:"50%", transform:"translate(-50%,-50%)",
                  }}/>

                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"28px", maxWidth:"520px", width:"90%", zIndex:1 }}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Portrait — large */}
                    <div style={{ position:"relative", width:"clamp(160px,22vw,260px)", height:"clamp(300px,44vw,500px)",
                      borderRadius:"6px", overflow:"hidden", background:"transparent",
                      boxShadow:`0 0 0 1px ${active.color}40, 0 0 80px ${active.color}30, 0 20px 60px rgba(0,0,0,0.8)`,
                      animation:"spotlightReveal 0.45s cubic-bezier(0.16,1,0.3,1) forwards",
                    }}>
                      <img src={PORTRAIT_URLS[active.id]} alt={active.name}
                        style={{ width:"100%", height:"100%", objectFit:"contain", objectPosition:"center bottom" }}
                        onError={e=>{e.target.style.display="none"}}/>
                      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"40%",
                        background:`linear-gradient(to top, ${active.color}25 0%, transparent 100%)` }}/>
                      {/* Name badge on portrait */}
                      <div style={{ position:"absolute", bottom:"14px", left:0, right:0, textAlign:"center" }}>
                        <span style={{ fontSize:"clamp(11px,1.4vw,14px)", fontWeight:800, color:active.color,
                          letterSpacing:"0.18em", textTransform:"uppercase",
                          textShadow:`0 0 20px ${active.color}, 0 2px 8px rgba(0,0,0,0.9)`,
                          fontFamily:"'Palatino Linotype',serif" }}>{active.name}</span>
                      </div>
                    </div>

                    {/* Info card */}
                    <div style={{ width:"100%", padding:"22px 26px",
                      border:`1px solid ${active.color}28`,
                      borderRadius:"8px",
                      background:`linear-gradient(160deg, rgba(${active.color.slice(1).match(/../g).map(h=>parseInt(h,16)).join(",")},0.06) 0%, rgba(2,2,0,0.92) 100%)`,
                      backdropFilter:"blur(12px)",
                      boxShadow:`0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 ${active.color}20`,
                      textAlign:"center",
                      animation:"spotlightReveal 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both",
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
                        <div style={{ flex:1, height:"1px", background:`linear-gradient(to right,transparent,${active.color}35)` }}/>
                        <span style={{ fontSize:"9px", letterSpacing:"0.22em", color:active.color, opacity:0.75, textTransform:"uppercase", fontFamily:"serif" }}>{active.lens}</span>
                        <div style={{ flex:1, height:"1px", background:`linear-gradient(to left,transparent,${active.color}35)` }}/>
                      </div>
                      <p style={{ fontSize:"clamp(12px,1.5vw,14px)", color:"rgba(201,168,76,0.6)", lineHeight:1.85, fontStyle:"italic", marginBottom:"18px", fontFamily:"'Palatino Linotype',serif" }}>
                        {active.description}
                      </p>
                      <p style={{ fontSize:"clamp(11px,1.3vw,13px)", color:active.color, opacity:0.7, fontStyle:"italic", letterSpacing:"0.04em", fontFamily:"'Palatino Linotype',serif" }}>
                        "{active.tagline}"
                      </p>
                    </div>

                    {/* Dismiss hint */}
                    <p style={{ fontSize:"9px", color:"rgba(201,168,76,0.2)", letterSpacing:"0.15em", textTransform:"uppercase" }}>
                      tap anywhere to dismiss
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!active && phase>=5 && (
              <p style={{ fontSize:"clamp(8px,1vw,10px)", color:"rgba(201,168,76,0.15)", fontStyle:"italic", letterSpacing:"0.1em", marginTop:"4px" }}>
                touch a member to know them
              </p>
            )}
          </div>
        )}

        <div style={{ marginTop:"clamp(28px,5vw,52px)", textAlign:"center", opacity:phase>=6?1:0, animation:phase>=6?"fadeUp 1s ease forwards":"none" }}>
          <button onClick={onEnter} style={{ position:"relative", background:"transparent", color:"#c9a84c", border:"1px solid rgba(201,168,76,0.4)", borderRadius:"3px", padding:"clamp(13px,2vw,18px) clamp(32px,5vw,60px)", fontSize:"clamp(10px,1.3vw,13px)", fontWeight:700, cursor:"pointer", letterSpacing:"0.22em", textTransform:"uppercase", fontFamily:"'Palatino Linotype',serif", transition:"all 0.4s ease", overflow:"hidden", animation:"glowPulse 4s ease-in-out infinite" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(201,168,76,0.08)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.7)"; e.currentTarget.style.boxShadow="0 0 50px rgba(201,168,76,0.15)"; e.currentTarget.style.letterSpacing="0.28em"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="rgba(201,168,76,0.4)"; e.currentTarget.style.boxShadow=""; e.currentTarget.style.letterSpacing="0.22em"; }}
          >
            Consult the Council
          </button>
          <p style={{ color:"rgba(201,168,76,0.15)", fontSize:"clamp(8px,1vw,10px)", marginTop:"14px", letterSpacing:"0.14em", fontStyle:"italic" }}>
            One question · One session · One verdict
          </p>
        </div>

      </div>
    </div>
  );
};


// ── Language selector screen ──────────────────────────────────
const LanguageScreen = ({ onSelect, lang }) => {
  const t = UI[lang] || UI.en;
  const [vis, setVis] = useState(false);
  const [hovered, setHovered] = useState(null);
  useEffect(() => { const timer = setTimeout(() => setVis(true), 100); return () => clearTimeout(timer); }, []);
  return (
    <div style={{ minHeight:"100vh", background:"#020200", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:"500px", height:"500px", background:"radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ textAlign:"center", marginBottom:"clamp(28px,5vw,44px)", opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(16px)", transition:"all 0.8s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ fontSize:"36px", marginBottom:"16px", opacity:0.5 }}>⚖️</div>
        <h1 style={{ fontFamily:"'Palatino Linotype','Palatino','Book Antiqua',serif", fontSize:"clamp(28px,5vw,42px)", fontWeight:400, letterSpacing:"0.2em", color:"#c9a84c", textTransform:"uppercase", marginBottom:"8px" }}>{t.title}</h1>
        <div style={{ width:"40px", height:"1px", background:"rgba(201,168,76,0.3)", margin:"12px auto" }}/>
        <p style={{ color:"rgba(201,168,76,0.3)", fontSize:"11px", letterSpacing:"0.14em", fontStyle:"italic", fontFamily:"'Palatino Linotype',serif" }}>{t.chooseLanguage}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:"8px", maxWidth:"580px", width:"90%", opacity:vis?1:0, transition:"opacity 0.8s ease 0.2s" }}>
        {LANGUAGES.map((lang, i) => (
          <button key={lang.code} onClick={() => onSelect(lang.code)}
            style={{ display:"flex", alignItems:"center", gap:"9px", background: hovered===lang.code ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.02)", border:`1px solid ${hovered===lang.code ? "rgba(201,168,76,0.4)" : "rgba(201,168,76,0.12)"}`, borderRadius:"8px", padding:"10px 14px", cursor:"pointer", transition:"all 0.18s", color:"#c8b99a", fontFamily:"'Palatino Linotype',serif", animation:`fadeSlideIn 0.4s ease ${i*0.04}s both` }}
            onMouseEnter={() => setHovered(lang.code)} onMouseLeave={() => setHovered(null)}
          >
            <span style={{ fontSize:"18px" }}>{lang.flag}</span>
            <span style={{ fontSize:"13px", fontWeight: hovered===lang.code ? 700 : 400, letterSpacing:"0.04em", color: hovered===lang.code ? "#c9a84c" : "#8a7a5a" }}>{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const SetupScreen = ({ onStart, lang, onChangeLang }) => {
  const t = UI[lang] || UI.en;
  const [stage, setStage] = useState("intro");
  const [selected, setSelected] = useState([]);
  const [introStep, setIntroStep] = useState(0);
  const [charReveal, setCharReveal] = useState(-1);

  useEffect(() => {
    if(stage !== "intro") return;
    const timers = [
      setTimeout(() => setIntroStep(1), 900),
      setTimeout(() => setIntroStep(2), 2200),
      setTimeout(() => setIntroStep(3), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [stage]);

  useEffect(() => {
    if(stage !== "assembling") return;
    const chars = Object.values(CHARACTERS);
    let i = 0;
    const tick = () => {
      if(i <= chars.length) { setCharReveal(i); i++; setTimeout(tick, 160); }
      else setTimeout(() => setStage("ready"), 300);
    };
    setTimeout(tick, 200);
  }, [stage]);

  const toggle = id => {
    if(selected.includes(id)) setSelected(p => p.filter(s=>s!==id));
    else if(selected.length < 4) setSelected(p => [...p, id]);
  };
  const canStart = selected.length >= 2;
  const chars = Object.values(CHARACTERS);

  if(stage === "intro") return (
    <div style={{ minHeight:"100vh", background:"#020200", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:"600px", height:"600px", background:"radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ textAlign:"center", padding:"0 24px", maxWidth:"500px" }}>
        <div style={{ fontSize:"52px", marginBottom:"28px", opacity:introStep>=1?0.7:0, transition:"opacity 1.2s ease", filter:"sepia(0.3)" }}>⚖️</div>
        <h1 style={{ fontFamily:"'Palatino Linotype','Palatino','Book Antiqua',serif", fontSize:"clamp(42px,8vw,72px)", fontWeight:400, letterSpacing:"0.18em", color:"#c9a84c", marginBottom:"6px", opacity:introStep>=1?1:0, transform:introStep>=1?"translateY(0)":"translateY(20px)", transition:"all 1.4s cubic-bezier(0.16,1,0.3,1)", textShadow:"0 0 40px rgba(201,168,76,0.2)" }}>{t.title}</h1>
        <div style={{ width:"60px", height:"1px", background:"linear-gradient(to right,transparent,rgba(201,168,76,0.5),transparent)", margin:"16px auto 20px", opacity:introStep>=1?1:0, transition:"opacity 1.4s ease 0.3s" }}/>
        <p style={{ fontFamily:"'Palatino Linotype',serif", fontSize:"clamp(13px,2vw,16px)", color:"rgba(201,168,76,0.4)", letterSpacing:"0.12em", lineHeight:"1.8", fontStyle:"italic", opacity:introStep>=2?1:0, transform:introStep>=2?"translateY(0)":"translateY(10px)", transition:"all 1s ease 0.2s", marginBottom:"40px" }}>
          {getCharFields("dan",lang).description || t.danDesc}
        </p>
        <button onClick={() => setStage("assembling")} style={{ opacity:introStep>=3?1:0, transform:introStep>=3?"translateY(0)":"translateY(10px)", transition:"all 0.8s ease", background:"transparent", color:"rgba(201,168,76,0.6)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:"4px", padding:"12px 36px", fontSize:"11px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer", fontFamily:"'Palatino Linotype',serif" }}
          onMouseEnter={e=>{ e.currentTarget.style.color="#c9a84c"; e.currentTarget.style.borderColor="rgba(201,168,76,0.5)"; e.currentTarget.style.background="rgba(201,168,76,0.05)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.color="rgba(201,168,76,0.6)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.25)"; e.currentTarget.style.background="transparent"; }}
        >{t.enterChamber}</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#020200", color:"#c8b99a", fontFamily:"'Palatino Linotype','Palatino','Book Antiqua',serif", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ maxWidth:"800px", margin:"0 auto", padding:"clamp(24px,6vw,60px) clamp(16px,4vw,24px)" }}>
        <div style={{ textAlign:"center", marginBottom:"clamp(28px,5vw,48px)", opacity:stage==="ready"?1:0.7, transition:"opacity 0.8s" }}>
          <div style={{ fontSize:"24px", marginBottom:"10px", opacity:0.5 }}>⚖️</div>
          <h1 style={{ fontSize:"clamp(20px,4vw,28px)", fontWeight:400, letterSpacing:"0.2em", color:"#c9a84c", marginBottom:"6px", textTransform:"uppercase" }}>{t.title}</h1>
          <div style={{ width:"40px", height:"1px", background:"rgba(201,168,76,0.3)", margin:"10px auto 14px" }}/>
          <p style={{ color:"rgba(201,168,76,0.3)", fontSize:"12px", letterSpacing:"0.1em", fontStyle:"italic" }}>{t.subtitle}</p>
          <button onClick={onChangeLang} style={{ marginTop:"12px", background:"transparent", border:"1px solid rgba(201,168,76,0.15)", borderRadius:"16px", padding:"4px 14px", color:"rgba(201,168,76,0.4)", fontSize:"11px", cursor:"pointer", letterSpacing:"0.08em", fontFamily:"'Palatino Linotype',serif" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(201,168,76,0.4)"; e.currentTarget.style.color="rgba(201,168,76,0.7)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(201,168,76,0.15)"; e.currentTarget.style.color="rgba(201,168,76,0.4)"; }}
          >{LANGUAGES.find(l=>l.code===lang)?.flag} {LANGUAGES.find(l=>l.code===lang)?.label} ↩</button>
        </div>

        <div style={{ background:"linear-gradient(135deg,rgba(13,10,2,0.9),rgba(8,6,0,0.95))", border:"1px solid rgba(201,168,76,0.25)", borderRadius:"14px", padding:"18px 20px", marginBottom:"28px", display:"flex", alignItems:"center", gap:"16px", opacity:stage==="ready"?1:charReveal>=0?1:0, transition:"opacity 0.6s" }}>
          <Avatar char={DAN} size={54} active glow />
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"5px" }}>
              <span style={{ fontWeight:700, color:"#c9a84c", fontSize:"17px" }}>Dan</span>
              <span style={{ fontSize:"9px", background:"rgba(201,168,76,0.1)", color:"rgba(201,168,76,0.6)", borderRadius:"4px", padding:"2px 8px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>{t.alwaysPresent}</span>
            </div>
            <p style={{ fontSize:"12px", color:"rgba(201,168,76,0.35)", fontStyle:"italic", lineHeight:"1.5", margin:0 }}>{t.danDesc}</p>
          </div>
        </div>

        <div style={{ fontSize:"9px", fontWeight:800, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(201,168,76,0.25)", marginBottom:"14px", display:"flex", alignItems:"center", gap:"10px" }}>
          <span>{t.selectMembers}</span>
          <span style={{ color:selected.length>=2?"rgba(74,222,128,0.6)":"rgba(201,168,76,0.2)" }}>({selected.length} / 4)</span>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,220px),1fr))", gap:"10px", marginBottom:"32px" }}>
          {chars.map((c, idx) => {
            const sel = selected.includes(c.id);
            const revealed = charReveal > idx || stage === "ready";
            return (
              <div key={c.id} onClick={() => revealed && toggle(c.id)} style={{ background:sel?hex2rgba(c.color,0.07):"rgba(201,168,76,0.02)", border:`1px solid ${sel?hex2rgba(c.color,0.5):hex2rgba(c.color,0.12)}`, borderRadius:"14px", padding:"18px", cursor:revealed?"pointer":"default", transition:"all 0.25s", opacity:revealed?1:0, transform:revealed?"translateY(0)":"translateY(16px)", position:"relative" }}>

                <div style={{ position:"relative", width:"100%", height:"clamp(160px,20vw,220px)", borderRadius:"8px", overflow:"hidden", marginBottom:"2px",
                  border:`1px solid ${sel ? hex2rgba(c.color,0.5) : hex2rgba(c.color,0.12)}`,
                  background:"#020200",
                  boxShadow: sel ? `0 0 24px ${hex2rgba(c.color,0.3)}, inset 0 0 20px ${hex2rgba(c.color,0.05)}` : "none",
                  transition:"all 0.3s ease",
                }}>
                  <img src={PORTRAIT_URLS[c.id]} alt={c.name}
                    style={{ width:"100%", height:"100%", objectFit:"contain", objectPosition:"center bottom",
                      filter:`brightness(${sel?1:0.75})`, transition:"all 0.3s ease" }}
                    onError={e=>{ e.target.style.display="none"; }}/>
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"45%",
                    background:`linear-gradient(to top, rgba(2,2,0,0.85) 0%, transparent 100%)` }}/>
                  {sel && <div style={{ position:"absolute", top:"10px", right:"10px",
                    width:"20px", height:"20px", borderRadius:"50%",
                    background:c.color, display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"11px", fontWeight:900, color:"#020200", boxShadow:`0 0 10px ${c.color}` }}>✓</div>}
                </div>
                <div style={{ marginTop:"10px", fontWeight:700, fontSize:"16px", color:sel?c.color:"#c8b99a", marginBottom:"3px" }}>{c.name}</div>
                <div style={{ fontSize:"11px", color:hex2rgba(c.color,0.5), marginBottom:"8px", fontStyle:"italic" }}>{getCharFields(c.id,lang).title || c.title}</div>
                <p style={{ fontSize:"11px", color:"rgba(201,168,76,0.25)", lineHeight:"1.5", marginBottom:"10px", fontStyle:"italic" }}>"{getCharFields(c.id,lang).tagline || c.tagline}"</p>
                <div style={{ fontSize:"9px", background:hex2rgba(c.color,0.08), color:hex2rgba(c.color,0.6), borderRadius:"4px", padding:"3px 8px", display:"inline-block", fontWeight:700, letterSpacing:"0.08em", border:`1px solid ${hex2rgba(c.color,0.15)}`, textTransform:"uppercase" }}>{getCharFields(c.id,lang).lens || c.lens}</div>
              </div>
            );
          })}
        </div>

        <button onClick={() => canStart && onStart(selected.map(id=>CHARACTERS[id]))} disabled={!canStart} style={{ width:"100%", padding:"16px", background:canStart?"rgba(201,168,76,0.1)":"transparent", color:canStart?"#c9a84c":"rgba(201,168,76,0.2)", border:`1px solid ${canStart?"rgba(201,168,76,0.35)":"rgba(201,168,76,0.06)"}`, borderRadius:"10px", fontSize:"13px", fontWeight:700, cursor:canStart?"pointer":"not-allowed", letterSpacing:"0.14em", textTransform:"uppercase", transition:"all 0.2s" }}
          onMouseEnter={e=>{ if(canStart){ e.currentTarget.style.background="rgba(201,168,76,0.18)"; }}}
          onMouseLeave={e=>{ if(canStart){ e.currentTarget.style.background="rgba(201,168,76,0.1)"; }}}
        >{canStart ? t.convene : t.selectAtLeast}</button>
      </div>
    </div>
  );
};

const DebateScreen = ({ characters, onClose, lang }) => {
  const t = UI[lang] || UI.en;
  const [phase, setPhase] = useState("question");
  const [question, setQuestion] = useState("");
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [loadingSpeaker, setLoadingSpeaker] = useState(null);
  const [history, setHistory] = useState([]);
  const [context, setContext] = useState({});
  const [checkinAnswer, setCheckinAnswer] = useState(null);
  const [followUpQ, setFollowUpQ] = useState("");
  const [verdictRevealed, setVerdictRevealed] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [remainingPickers, setRemainingPickers] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [entered, setEntered] = useState(false);
  const [pendingVerdictHistory, setPendingVerdictHistory] = useState(null);
  const [fewshotExamples, setFewshotExamples] = useState({});
  const [apiError, setApiError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { setTimeout(() => setEntered(true), 50); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [feed, loading, pitches]);

  const post = async (path, body, timeoutMs=55000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${API_URL}${path}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body), signal:controller.signal });
      clearTimeout(timer);
      if(!res.ok) {
        let detail = "";
        try { const err = await res.json(); detail = JSON.stringify(err); } catch(_){}
        throw new Error(`${path} failed: ${res.status} ${detail}`);
      }
      return res.json();
    } catch(e) {
      clearTimeout(timer);
      if(e.name === "AbortError") throw new Error(`${path} timed out after ${timeoutMs/1000}s`);
      throw e;
    }
  };

  const charConfigs = characters.map(c => ({ id:c.id, name:c.name, title:c.title, emoji:c.emoji, color:c.color, prompt:"" }));

  const handleQuestion = async () => {
    if(!question.trim()) return;
    setPhase("loading");
    setFeed([{ type:"question_bubble", text:question }]); setApiError(null);
    setLoading(true); setLoadingLabel("…"); setLoadingSpeaker(DAN); setActiveSpeaker("dan");
    try {
      const data = await post("/debate/context", { question, characters:charConfigs, language:lang });
      if(data.questions && data.questions.length > 0) {
        setFeed(p => [...p, { type:"context_block", questions:data.questions }]);
        setPhase("context");
        setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
      } else {
        setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
        await startDebateFromContext({}, []);
      }
    } catch(e) {
      console.error(e);
      setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
    }
  };

  const startDebateFromContext = async (ctxMap, ctxHistory, currentQuestion=question) => {
    setContext(ctxMap); setHistory(ctxHistory); setCurrentRound(1);
    setLoading(true); setLoadingLabel("…"); setLoadingSpeaker(DAN); setActiveSpeaker("dan");
    let openingText = null;
    const [openingResult, ...fewshotResults] = await Promise.allSettled([
      post("/debate/opening", { question:currentQuestion, characters:charConfigs, context:ctxMap, language:lang }),
      ...characters.map(c => post("/debate/fewshot", { question:currentQuestion, character_id:c.id, language:lang }))
    ]);
    if(openingResult.status === "fulfilled") openingText = openingResult.value?.opening;
    const examples = {};
    fewshotResults.forEach((r, i) => { if(r.status === "fulfilled" && r.value?.example) examples[characters[i].id] = r.value.example; });
    setFewshotExamples(examples);
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
    if(openingText) setFeed(p => [...p, { type:"opening", text:openingText }]);
    await startRoundPicking(1, ctxMap, ctxHistory, currentQuestion);
  };

  const handleContextSubmit = async (answers) => {
    const ctxMap = {};
    const qs = feed.find(f => f.type==="context_block")?.questions || [];
    qs.forEach((q,i) => { ctxMap[q] = answers[i]; });
    setFeed(p => p.map(f => f.type==="context_block" ? {...f, answered:true} : f));
    const ctxHistory = [{ type:"user_context", text:Object.entries(ctxMap).map(([q,a])=>`${q} → ${a}`).join(" | ") }];
    await startDebateFromContext(ctxMap, ctxHistory);
  };

  const startRoundPicking = async (roundNum, ctx=context, hist=history, currentQuestion=question) => {
    setFeed(p => [...p, { type:"round_header", label:`Round ${roundNum}` }]);
    setPhase("picking");
    setLoading(true); setLoadingLabel(t.councilPrepares); setLoadingSpeaker(null); setActiveSpeaker(null);
    const fetchedPitches = [];
    const pitchResults = await Promise.allSettled(
      characters.map(c => post("/debate/single_sentence", { question:currentQuestion, character_id:c.id, characters:charConfigs, round:roundNum, context:ctx, history:hist, language:lang }))
    );
    pitchResults.forEach((result, i) => {
      const c = characters[i];
      if(result.status === "fulfilled" && result.value?.pitch) fetchedPitches.push({ character_id:c.id, pitch:result.value.pitch, char:c });
      else { console.error("pitch failed for", c.name, result.reason?.message); fetchedPitches.push({ character_id:c.id, pitch:"...", char:c }); }
    });
    if(fetchedPitches.length === 0) characters.forEach(c => fetchedPitches.push({ character_id:c.id, pitch:"...", char:c }));
    setPitches(fetchedPitches);
    setRemainingPickers(characters.map(c => c.id));
    setLoading(false);
    setFeed(p => [...p, { type:"picker", roundNum, pitches:fetchedPitches, currentQuestion }]);
  };

  const handlePickSpeaker = async (characterId) => {
    setFeed(p => p.map(f => f.type==="picker" ? {...f, chosen:characterId} : f));
    const char = characters.find(c => c.id===characterId);
    setActiveSpeaker(characterId);
    setLoading(true); setLoadingLabel(`${char.name} speaks…`); setLoadingSpeaker(char);
    try {
      const pickerItem = feed.filter(f=>f.type==="picker").at(-1);
      const activeQuestion = pickerItem?.currentQuestion || question;
      const data = await post("/debate/single_turn", { question:activeQuestion, character_id:characterId, characters:charConfigs, round:currentRound, context, checkin_answer:checkinAnswer, history, language:lang, fewshot_example:fewshotExamples[characterId]||"" });
      const turn = data.turn;
      const newHistory = [...history, turn];
      setHistory(newHistory);
      const roundTurns = newHistory.filter(h => h.round===currentRound && h.type==="agent");
      const idx = roundTurns.length - 1;
      setFeed(p => [...p, { type:"agent", ...turn, slideDir:idx%2===0?"left":"right" }]);
      const newRemaining = remainingPickers.filter(id => id!==characterId);
      setRemainingPickers(newRemaining);
      if(newRemaining.length > 0) {
        const newPitches = pitches.filter(p => newRemaining.includes(p.character_id));
        setFeed(p => [...p, { type:"picker", roundNum:currentRound, pitches:newPitches }]);
        setPhase("picking");
      } else {
        setActiveSpeaker("dan"); setLoadingLabel(t.danDeliberates); setLoadingSpeaker(DAN);
        await runCheckin(currentRound, newHistory, activeQuestion);
      }
    } catch(e) { console.error("handlePickSpeaker error:", e.message); }
    finally { setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null); }
  };

  const runCheckin = async (roundNum, hist=history, currentQuestion=question) => {
    try {
      const data = await post("/debate/checkin", { question:currentQuestion, characters:charConfigs, history:hist, context, round:roundNum, language:lang });
      if(roundNum >= 3){ data.needs_more_round=false; data.question=null; }
      let councilResponseTurn = null;
      if(data.council_question?.to) {
        const targetChar = characters.find(c => c.name===data.council_question.to);
        if(targetChar) {
          setActiveSpeaker(targetChar.id); setLoadingLabel(`${targetChar.name} ${t.respondsToDan}…`); setLoadingSpeaker(targetChar);
          try {
            const resp = await post("/debate/council_response", { question, character_id:targetChar.id, characters:charConfigs, round:roundNum, context, checkin_answer:data.council_question.question, history:hist, language:lang });
            councilResponseTurn = resp.turn; hist = [...hist, councilResponseTurn]; setHistory(hist);
          } catch(e) { console.error(e); }
          setActiveSpeaker(null); setLoadingSpeaker(null);
        }
      }
      setFeed(p => [...p,
        { type:"dan_checkin", summary:data.summary, question:data.question, userPrompt:data.user_prompt, councilQuestion:data.council_question, answered:false, needsMoreRound:data.needs_more_round, roundNum, revealed:false },
        ...(councilResponseTurn ? [{ type:"agent", ...councilResponseTurn, slideDir:"right", respondingToDan:true }] : []),
      ]);
      if(!data.needs_more_round) { setPendingVerdictHistory(hist); setPhase("checkin"); }
      else setPhase("checkin");
    } catch(e) { console.error("runCheckin error:", e); setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null); }
  };

  const handleCheckinAnswer = async (answer, roundNum) => {
    setCheckinAnswer(answer);
    setFeed(p => p.map(f => f.type==="dan_checkin"&&!f.answered ? {...f,answered:true,userAnswer:answer} : f));
    const nextRound = (roundNum||1)+1;
    setCurrentRound(nextRound);
    await startRoundPicking(nextRound, context, history);
  };

  const runVerdict = async (hist=history, currentQuestion=question) => {
    const cleanHist = hist.filter(h => !(h.type==="user_answer" && h.text==="—"));
    setLoading(true); setActiveSpeaker("dan"); setLoadingLabel(t.danWrites); setLoadingSpeaker(DAN);
    try {
      const data = await post("/debate/verdict", { question:currentQuestion, history:cleanHist, context, checkin_answer:checkinAnswer, language:lang });
      setFeed(p => [...p, { type:"verdict", data }]);
      setPhase("done");
    } catch(e) { console.error("runVerdict error:", e); }
    finally { setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null); }
  };

  const handleFollowUp = async () => {
    if(!followUpQ.trim()) return;
    const q = followUpQ.trim();
    setFollowUpQ(""); setQuestion(q);
    setHistory([]); setContext({}); setCheckinAnswer(null);
    setVerdictRevealed(false); setCurrentRound(1); setPitches([]); setRemainingPickers([]); setPendingVerdictHistory(null); setFewshotExamples({});
    setPhase("loading");
    setFeed([{ type:"question_bubble", text:q }]);
    setLoading(true); setLoadingLabel("…"); setLoadingSpeaker(DAN); setActiveSpeaker("dan");
    try {
      const data = await post("/debate/context", { question:q, characters:charConfigs, language:lang });
      if(data.questions && data.questions.length > 0) {
        setFeed(p => [...p, { type:"context_block", questions:data.questions }]);
        setPhase("context"); setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
      } else {
        setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
        await startDebateFromContext({}, [], q);
      }
    } catch(e) { console.error(e); }
    setLoading(false); setLoadingSpeaker(null); setActiveSpeaker(null);
  };

  return (
    <div style={{ height:"100vh", width:"100%", background:"#020200", color:"#c8b99a", fontFamily:"'Palatino Linotype','Palatino','Book Antiqua',serif", display:"flex", flexDirection:"column", overflow:"hidden", opacity:entered?1:0, transform:entered?"translateY(0)":"translateY(20px)", transition:"all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
      <div style={{ borderBottom:"1px solid rgba(201,168,76,0.08)", padding:"8px clamp(12px,4vw,20px)", flexShrink:0, background:"rgba(2,2,0,0.97)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"rgba(201,168,76,0.3)", fontSize:"16px", cursor:"pointer", padding:"4px 8px 4px 0", flexShrink:0 }}>←</button>
          <CouncilSeats characters={characters} activeSpeaker={activeSpeaker} />
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"20px clamp(12px,4vw,24px)", background:"#020200" }}>
        <div style={{ maxWidth:"700px", margin:"0 auto", width:"100%" }}>
          {phase === "question" && (
            <div style={{ textAlign:"center", padding:"clamp(40px,10vw,90px) 0 24px" }}>
              <div style={{ fontSize:"40px", marginBottom:"16px", opacity:0.4 }}>⚖️</div>
              <p style={{ color:"rgba(201,168,76,0.25)", fontSize:"15px", fontStyle:"italic", letterSpacing:"0.05em" }}>{t.councilAwaits}</p>
            </div>
          )}
          {feed.map((item, i) => {
            if(item.type==="question_bubble") return <QuestionBubble key={i} text={item.text}/>;
            if(item.type==="context_block") return <ContextBlock key={i} questions={item.questions} onSubmit={handleContextSubmit} t={t}/>;
            if(item.type==="opening") return <OpeningBlock key={i} text={item.text} t={t}/>;
            if(item.type==="round_header") return <RoundHeader key={i} label={item.label}/>;
            if(item.type==="agent") return <AgentTurn key={i} turn={item} slideDir={item.slideDir||"left"} respondingToDan={item.respondingToDan} t={t}/>;
            if(item.type==="picker") {
              const isLatest = feed.filter(f=>f.type==="picker").at(-1)===item;
              if(!isLatest||phase!=="picking") return null;
              return <SpeakerPicker key={i} pitches={item.pitches} onChoose={handlePickSpeaker} loading={loading} t={t}/>;
            }
            if(item.type==="dan_checkin") return (
              <DanBlock key={i} summary={item.summary} question={item.question} userPrompt={item.userPrompt} councilQuestion={item.councilQuestion} needsMoreRound={item.needsMoreRound} answered={item.answered} userAnswer={item.userAnswer} revealed={item.revealed} t={t}
                onReveal={()=>{ setFeed(p=>p.map((f,j)=>j===i?{...f,revealed:true}:f)); if(pendingVerdictHistory){ const h=pendingVerdictHistory; setPendingVerdictHistory(null); runVerdict(h); } }}
                onAnswer={ans=>handleCheckinAnswer(ans,item.roundNum)}
                onUserPromptAnswer={ans=>{ setFeed(p=>p.map((f,j)=>j===i?{...f,answered:true,userAnswer:ans}:f)); if(pendingVerdictHistory){ const h=[...pendingVerdictHistory,{type:"user_answer",text:ans}]; setPendingVerdictHistory(null); runVerdict(h); } }}
              />
            );
            if(item.type==="verdict") return (
              <div key={i}>
                <DebateClosedBanner revealed={verdictRevealed} onReveal={()=>setVerdictRevealed(true)} t={t}/>
                {verdictRevealed && <VerdictBlock verdict={item.data} t={t}/>}
              </div>
            );
            return null;
          })}
          {loading && <LoadingPulse label={loadingLabel} speaker={loadingSpeaker}/>}
          {apiError && !loading && (
            <div style={{ background:"rgba(251,100,60,0.08)", border:"1px solid rgba(251,100,60,0.2)", borderRadius:"10px", padding:"12px 16px", margin:"12px 0", fontSize:"12px", color:"rgba(251,100,60,0.7)", fontFamily:"monospace" }}>
              ⚠ {apiError}
              <button onClick={()=>setApiError(null)} style={{ marginLeft:"12px", background:"transparent", border:"none", color:"rgba(251,100,60,0.5)", cursor:"pointer", fontSize:"11px" }}>✕</button>
            </div>
          )}
          {phase==="done" && !loading && verdictRevealed && (
            <div style={{ marginTop:"28px", borderTop:"1px solid rgba(201,168,76,0.06)", paddingTop:"22px" }}>
              <p style={{ color:"rgba(201,168,76,0.2)", fontSize:"12px", marginBottom:"12px", fontStyle:"italic", letterSpacing:"0.06em" }}>{t.anotherQuestion}</p>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                <input value={followUpQ} onChange={e=>setFollowUpQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleFollowUp();}} placeholder={t.followUpPlaceholder}
                  style={{ flex:"1 1 200px", minWidth:0, background:"rgba(201,168,76,0.03)", border:"1px solid rgba(201,168,76,0.12)", borderRadius:"6px", color:"#d4c4a0", fontSize:"14px", padding:"10px 14px", outline:"none", fontFamily:"'Palatino Linotype',serif" }}
                  onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.35)"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.12)"}
                />
                <button onClick={handleFollowUp} style={{ background:"rgba(201,168,76,0.08)", color:"#c9a84c", border:"1px solid rgba(201,168,76,0.25)", borderRadius:"6px", padding:"10px 18px", fontWeight:700, cursor:"pointer", fontSize:"13px" }}>→</button>
                <button onClick={onClose} style={{ background:"transparent", color:"rgba(201,168,76,0.25)", border:"1px solid rgba(201,168,76,0.08)", borderRadius:"6px", padding:"10px 14px", fontSize:"12px", cursor:"pointer", letterSpacing:"0.06em" }}>{t.leave}</button>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
      </div>
      {phase==="question" && (
        <div style={{ borderTop:"1px solid rgba(201,168,76,0.06)", padding:"14px clamp(12px,4vw,20px)", background:"rgba(2,2,0,0.97)", flexShrink:0 }}>
          <div style={{ maxWidth:"700px", margin:"0 auto", display:"flex", gap:"10px" }}>
            <input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleQuestion();}} placeholder={t.questionPlaceholder}
              style={{ flex:1, minWidth:0, background:"rgba(201,168,76,0.03)", border:"1px solid rgba(201,168,76,0.15)", borderRadius:"8px", color:"#d4c4a0", fontSize:"16px", padding:"13px 16px", outline:"none", fontFamily:"'Palatino Linotype',serif" }}
              onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"} onBlur={e=>e.target.style.borderColor="rgba(201,168,76,0.15)"} autoFocus
            />
            <button onClick={handleQuestion} disabled={!question.trim()} style={{ background:question.trim()?"rgba(201,168,76,0.1)":"transparent", color:question.trim()?"#c9a84c":"rgba(201,168,76,0.2)", border:`1px solid ${question.trim()?"rgba(201,168,76,0.35)":"rgba(201,168,76,0.06)"}`, borderRadius:"8px", width:"48px", fontSize:"18px", cursor:question.trim()?"pointer":"not-allowed", flexShrink:0 }}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [lang, setLang] = useState("en");
  const [characters, setCharacters] = useState([]);
  const handleSelectLang = (code) => { setLang(code); setScreen("setup"); };
  const handleStartDebate = (chars) => { setCharacters(chars); setScreen("debate"); };
  const handleCloseDebate = () => { setScreen("landing"); setCharacters([]); };
  return (
    <div style={{ width:"100%", minHeight:"100vh", background:"#020200" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;min-height:100vh;background:#020200;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.15);border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:.8;transform:scale(1)}}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      `}</style>
      {screen==="landing"  && <LandingPage onEnter={()=>setScreen("language")}/>}
      {screen==="language" && <LanguageScreen onSelect={handleSelectLang} lang={lang}/>}
      {screen==="setup"    && <SetupScreen onStart={handleStartDebate} lang={lang} onChangeLang={()=>setScreen("language")}/>}
      {screen==="debate"   && <DebateScreen characters={characters} onClose={handleCloseDebate} lang={lang}/>}
    </div>
  );
}