// DOM ELEMENTS
const introModal = document.getElementById('intro-modal');
const hipaaConsent = document.getElementById('hipaa-consent-chk');
const startTourBtn = document.getElementById('start-tour-btn');
const exitModalBtn = document.getElementById('exit-modal-btn');

const inputModeModal = document.getElementById('input-mode-modal');
const chooseManualBtn = document.getElementById('choose-manual-btn');
const chooseVoiceBtn = document.getElementById('choose-voice-btn');
const voiceConsentChk = document.getElementById('voice-consent-chk');

const panelPositionModal = document.getElementById('panel-position-modal');
const panelLeftBtn = document.getElementById('panel-left-btn');
const panelRightBtn = document.getElementById('panel-right-btn');

const settingsModal = document.getElementById('settings-modal');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanelLeft = document.getElementById('settings-panel-left');
const settingsPanelRight = document.getElementById('settings-panel-right');
const settingsTourVoiceOff = document.getElementById('settings-tour-voice-off');
const settingsTourVoiceOn = document.getElementById('settings-tour-voice-on');
const settingsCloseBtn = document.getElementById('settings-close-btn');

const messageInput = document.getElementById('message-input');
const micBtn = document.getElementById('mic-btn');
const micLock = document.getElementById('mic-lock');
const mainPromptHeader = document.getElementById('main-prompt-header');
const stepIndicator = document.getElementById('step-indicator');
const questionDisplay = document.getElementById('question-display');

const modalLangSelect = document.getElementById('modal-lang-select');
const canvasLangSelect = document.getElementById('canvas-lang-select');
const canvasFormSelect = document.getElementById('canvas-form-select');

const ctrlStart = document.getElementById('ctrl-start');
const ctrlPause = document.getElementById('ctrl-pause');
const ctrlFinish = document.getElementById('ctrl-finish');
const ctrlRepeat = document.getElementById('ctrl-repeat');
const ctrlSkip = document.getElementById('ctrl-skip');
const ctrlReset = document.getElementById('ctrl-reset');

const navTourBtn = document.getElementById('nav-tour-btn');
const navReadBtn = document.getElementById('nav-read-btn');
const sidebar = document.getElementById('sidebar');

// UI TOUR ELEMENTS
const tourHighlight = document.getElementById('tour-highlight');
const tourTooltip = document.getElementById('tour-tooltip');
const tourText = document.getElementById('tour-text');
const tourNextBtn = document.getElementById('tour-next');
const tourStopBtn = document.getElementById('tour-stop');
const tourExitBtn = document.getElementById('tour-exit');
const tourVoiceToggleBtn = document.getElementById('tour-voice-toggle');
const tourVoiceIcon = document.getElementById('tour-voice-icon');

// WORKFLOWS
const intakeWorkflows = {
    admission: [
        "What is your legal full name?",
        "What is your date of birth?",
        "Please verify your current residential address.",
        "Who should be listed as your primary emergency contact?"
    ],
    sleep: [
        "How many hours of sleep do you typically average per night?",
        "Do you experience regular daytime fatigue or morning headaches?",
        "Has a sleeping partner ever reported that you snore loudly or gasp for air?",
        "Please specify any history of high blood pressure or respiratory tracking."
    ],
    pain: [
        "Where is your pain located most frequently?",
        "How would you rate your pain on a scale from 0 to 10?",
        "What tends to make your pain worse or better?",
        "Have you tried any treatments or medications for this pain?"
    ],
    mental: [
        "How often have you felt down, depressed, or hopeless in the last two weeks?",
        "Do you experience frequent anxiety or panic episodes?",
        "Have you ever had thoughts of harming yourself or others?",
        "Are you currently seeing a counselor, therapist, or psychiatrist?"
    ],
    obgyn: [
        "When was the date of your last menstrual period?",
        "Have you ever been pregnant before? If so, how many times?",
        "Do you have any history of complications during pregnancy or delivery?",
        "Are you currently using any form of contraception?"
    ],
    peds: [
        "What is the child's full name and date of birth?",
        "Has the child received routine vaccinations on schedule?",
        "Have there been any recent changes in appetite, sleep, or behavior?",
        "Does the child have any known allergies or chronic conditions?"
    ],
    sdoh: [
        "Do you ever worry about having enough food for yourself or your household?",
        "Are you currently experiencing challenges with housing stability or safety?",
        "Do transportation issues ever prevent you from attending appointments?",
        "Would you like assistance connecting to community or social support resources?"
    ],
    insurance: [
        "What is the name of your primary insurance provider?",
        "What is your member or policy ID number?",
        "Is there a secondary insurance policy we should be aware of?",
        "Who is the primary subscriber on this insurance plan?"
    ],
    meds: [
        "Please list all current medications you are taking, including doses.",
        "Do you take any over-the-counter supplements or herbal products?",
        "Have you missed any doses of your medications in the last week?",
        "Have you experienced any side effects from your medications?"
    ],
    allergy: [
        "Do you have any known drug allergies?",
        "Do you have any food or environmental allergies?",
        "What reactions do you experience when exposed to these allergens?",
        "Have you ever required emergency treatment for an allergic reaction?"
    ]
};

let currentStepIndex = -1;
let currentFormType = "admission";
let tourActive = false;
let collectedAnswers = [];

let voiceModeEnabled = false;
let guidedTourVoiceEnabled = true;

// UI GUIDED TOUR STEPS
const uiTourSteps = [
    { element: "#nav-tour-btn", text: "This button starts the guided tour to explain the screen and how the assistant works." },
    { element: "#canvas-lang-select", text: "Use this menu to change the language of the assistant." },
    { element: "#canvas-form-select", text: "Use this menu to choose which clinical form you want to complete." },
    { element: "#ctrl-start", text: "This is the Start Demo button. Click it when you are ready to begin the guided demo and questions." },
    { element: "#ctrl-pause", text: "Pause temporarily stops the question flow if you need a break." },
    { element: "#ctrl-skip", text: "Skip moves you to the next question without answering the current one." },
    { element: "#ctrl-repeat", text: "Repeat shows the current question again if you need to hear or read it twice." },
    { element: "#ctrl-finish", text: "Finish ends the intake session when you are done answering questions." },
    { element: "#ctrl-reset", text: "Reset clears the current answers and restarts the workflow from the beginning." },
    { element: "#settings-btn", text: "The Settings button lets you change preferences like panel position, guided tour voice, and other options." },
    { element: "#message-input", text: "This white box is where you type or dictate your answers." },
    { element: "#mic-btn", text: "This mic icon controls voice input. It turns red while waiting for consent and teal when actively listening." }
];

let uiTourIndex = 0;
let uiTourActive = false;

// COMPLIANCE GATE
startTourBtn.disabled = true;

hipaaConsent.addEventListener('change', () => {
    startTourBtn.disabled = !hipaaConsent.checked;
});

modalLangSelect.addEventListener('change', () => {
    canvasLangSelect.value = modalLangSelect.value;
});

// PANEL POSITION PERSISTENCE
const PANEL_POSITION_KEY = "cia_panel_position";
const TOUR_VOICE_KEY = "cia_tour_voice";

function applySavedPanelPosition() {
    const saved = localStorage.getItem(PANEL_POSITION_KEY);
    if (saved === "left") {
        sidebar.classList.remove('sidebar-right');
        sidebar.classList.add('sidebar-left');
    } else {
        sidebar.classList.remove('sidebar-left');
        sidebar.classList.add('sidebar-right');
    }
}

function savePanelPosition(position) {
    localStorage.setItem(PANEL_POSITION_KEY, position);
    applySavedPanelPosition();
}

function applySavedTourVoice() {
    const saved = localStorage.getItem(TOUR_VOICE_KEY);
    if (saved === "off") {
        guidedTourVoiceEnabled = false;
        tourVoiceIcon.textContent = "mic_off";
    } else {
        guidedTourVoiceEnabled = true;
        tourVoiceIcon.textContent = "mic";
    }
}

function saveTourVoice(state) {
    localStorage.setItem(TOUR_VOICE_KEY, state);
    applySavedTourVoice();
}

// INITIAL PANEL POSITION
applySavedPanelPosition();
applySavedTourVoice();

// TOUR ENGINE – QUESTIONS
function updatePromptDisplay() {
    const activeQuestions = intakeWorkflows[currentFormType];

    if (currentStepIndex >= 0 && currentStepIndex < activeQuestions.length) {
        const q = activeQuestions[currentStepIndex];
        questionDisplay.textContent = q;
        stepIndicator.style.display = 'block';
        stepIndicator.textContent = `Step ${currentStepIndex + 1} of ${activeQuestions.length}`;
        setMicState(voiceModeEnabled);
        ctrlStart.classList.add('active-state');
        ctrlPause.classList.remove('active-state');

        if (voiceModeEnabled && guidedTourVoiceEnabled) {
            speakText(q);
        }
    } else if (currentStepIndex >= activeQuestions.length) {
        questionDisplay.textContent = "";
        mainPromptHeader.textContent = "Thank you. Your clinical intake responses have been captured.";
        stepIndicator.style.display = 'none';
        endTourProcessingStates();
        generateFhirQuestionnaireResponse();
    }
}

function initiateTourFlow() {
    tourActive = true;
    currentStepIndex = 0;
    collectedAnswers = [];
    messageInput.value = "";
    ctrlStart.classList.remove('start-pulse');
    updatePromptDisplay();
}

function endTourProcessingStates() {
    tourActive = false;
    currentStepIndex = -1;
    navTourBtn.classList.remove('active-state');
    setMicState(false);
    ctrlStart.classList.remove('active-state');
    ctrlPause.classList.remove('active-state');
    stepIndicator.style.display = 'none';
    ctrlStart.classList.remove('start-pulse');
}

// EVENT LISTENERS — MODAL / TOUR
startTourBtn.addEventListener('click', () => {
    startUITour();
});

navTourBtn.addEventListener('click', () => {
    startUITour();
});

exitModalBtn.addEventListener('click', () => {
    introModal.style.display = 'none';
    endTourProcessingStates();
    mainPromptHeader.textContent = "Hi, what should we dive into today?";
    questionDisplay.textContent = "";
});

canvasFormSelect.addEventListener('change', () => {
    currentFormType = canvasFormSelect.value;
    if (tourActive) {
        currentStepIndex = 0;
        collectedAnswers = [];
        updatePromptDisplay();
    }
});

navReadBtn.addEventListener('click', () => {
    navReadBtn.classList.toggle('active-state');
});

// SETTINGS
settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});

settingsCloseBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

settingsPanelLeft.addEventListener('click', () => {
    savePanelPosition("left");
});

settingsPanelRight.addEventListener('click', () => {
    savePanelPosition("right");
});

settingsTourVoiceOff.addEventListener('click', () => {
    saveTourVoice("off");
});

settingsTourVoiceOn.addEventListener('click', () => {
    saveTourVoice("on");
});

// SIDEBAR BUTTONS – QUESTION FLOW
ctrlStart.addEventListener('click', () => {
    ctrlStart.classList.remove('start-pulse');
    inputModeModal.style.display = 'flex';
});

ctrlPause.addEventListener('click', () => {
    setMicState(false);
    ctrlPause.classList.add('active-state');
    ctrlStart.classList.remove('active-state');
});

ctrlSkip.addEventListener('click', () => {
    if (tourActive) {
        collectedAnswers[currentStepIndex] = messageInput.value.trim();
        currentStepIndex++;
        messageInput.value = "";
        messageInput.style.height = 'auto';
        updatePromptDisplay();
    }
});

ctrlRepeat.addEventListener('click', () => {
    if (tourActive) {
        questionDisplay.style.opacity = 0.3;
        setTimeout(() => questionDisplay.style.opacity = 1, 200);
        if (voiceModeEnabled && guidedTourVoiceEnabled && currentStepIndex >= 0) {
            const q = intakeWorkflows[currentFormType][currentStepIndex];
            speakText(q);
        }
    }
});

ctrlFinish.addEventListener('click', () => {
    if (tourActive) {
        collectedAnswers[currentStepIndex] = messageInput.value.trim();
        currentStepIndex = intakeWorkflows[currentFormType].length;
        updatePromptDisplay();
    }
});

ctrlReset.addEventListener('click', () => {
    messageInput.value = "";
    messageInput.style.height = 'auto';
    collectedAnswers = [];
    if (!tourActive) {
        mainPromptHeader.textContent = "Hi, what should we dive into today?";
        questionDisplay.textContent = "";
    } else {
        currentStepIndex = 0;
        updatePromptDisplay();
    }
});

// INPUT MODE MODAL
chooseManualBtn.addEventListener('click', () => {
    voiceModeEnabled = false;
    micBtn.classList.remove('mic-red', 'mic-teal');
    micLock.style.display = 'none';
    inputModeModal.style.display = 'none';
    initiateTourFlow();
});

chooseVoiceBtn.addEventListener('click', () => {
    document.getElementById('voice-consent-section').style.display = 'block';
    micBtn.classList.add('mic-red');
    micLock.style.display = 'inline-block';
});

voiceConsentChk.addEventListener('change', () => {
    if (voiceConsentChk.checked) {
        micBtn.classList.remove('mic-red');
        micBtn.classList.add('mic-teal');
        micLock.style.display = 'none';
        voiceModeEnabled = true;
        inputModeModal.style.display = 'none';
        initiateTourFlow();
    }
});

// MIC STATE
function setMicState(active) {
    if (active) {
        micBtn.classList.add('mic-teal');
    } else {
        micBtn.classList.remove('mic-teal');
    }
}

// VOICE-TO-TEXT (WEB SPEECH API)
let recognition = null;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = canvasLangSelect.value;

    canvasLangSelect.addEventListener('change', () => {
        if (recognition) {
            recognition.lang = canvasLangSelect.value;
        }
    });

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + ' ';
        }
        messageInput.value = transcript.trim();
        messageInput.dispatchEvent(new Event('input'));
    };

    recognition.onend = () => {
        micBtn.classList.remove('mic-teal');
    };
} else {
    console.warn('Web Speech API not supported in this browser.');
}

micBtn.addEventListener('click', () => {
    if (!voiceModeEnabled) {
        alert("Voice mode requires consent and selection of Voice Input.");
        return;
    }

    if (!recognition) {
        alert("Voice input is not supported in this browser.");
        return;
    }

    if (micBtn.classList.contains('mic-teal')) {
        recognition.stop();
        micBtn.classList.remove('mic-teal');
    } else {
        recognition.start();
        micBtn.classList.add('mic-teal');
    }
});

// AUTO-EXPANDING TEXTAREA
messageInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// FHIR QUESTIONNAIRERESPONSE GENERATOR
function generateFhirQuestionnaireResponse() {
    const questions = intakeWorkflows[currentFormType];

    const questionnaireResponse = {
        resourceType: "QuestionnaireResponse",
        status: "completed",
        questionnaire: `Questionnaire/${currentFormType}`,
        item: questions.map((q, index) => ({
            linkId: `q${index + 1}`,
            text: q,
            answer: collectedAnswers[index]
                ? [{ valueString: collectedAnswers[index] }]
                : []
        }))
    };

    console.log("FHIR QuestionnaireResponse:", questionnaireResponse);
    alert("FHIR JSON generated. Check console for details.");
}

// GUIDED TOUR VOICE (TEXT-TO-SPEECH)
function speakText(text) {
    if (!guidedTourVoiceEnabled) return;
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = canvasLangSelect.value || 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// ===============================
// UI GUIDED TOUR ENGINE
// ===============================
function startUITour() {
    uiTourActive = true;
    uiTourIndex = 0;
    introModal.style.display = 'none';
    navTourBtn.classList.add('active-state');
    showUITourStep();
}

function showUITourStep() {
    const step = uiTourSteps[uiTourIndex];
    const el = document.querySelector(step.element);
    if (!el) return;

    const rect = el.getBoundingClientRect();

    // Highlight box
    tourHighlight.style.top = rect.top + "px";
    tourHighlight.style.left = rect.left + "px";
    tourHighlight.style.width = rect.width + "px";
    tourHighlight.style.height = rect.height + "px";
    tourHighlight.style.display = "block";

    // Tooltip text
    tourText.textContent = step.text;

    // SMART POSITIONING
    const tooltipHeight = 120;
    const screenHeight = window.innerHeight;

    if (rect.bottom + tooltipHeight > screenHeight - 40) {
        tourTooltip.style.top = rect.top - 10 + "px";
        tourTooltip.style.left = rect.right + 16 + "px";
    } else {
        tourTooltip.style.top = rect.bottom + 12 + "px";
        tourTooltip.style.left = rect.left + "px";
    }

    tourTooltip.style.display = "block";

    if (guidedTourVoiceEnabled) {
        speakText(step.text);
    }
}

function nextUITourStep() {
    uiTourIndex++;
    if (uiTourIndex >= uiTourSteps.length) {
        endUITour();
    } else {
        showUITourStep();
    }
}

function stopUITour() {
    endUITour();
}

function exitUITour() {
    endUITour();
}

function endUITour() {
    uiTourActive = false;
    tourHighlight.style.display = "none";
    tourTooltip.style.display = "none";
    navTourBtn.classList.remove('active-state');
    window.speechSynthesis.cancel();

    // After UI tour ends, ask panel position if not set
    const saved = localStorage.getItem(PANEL_POSITION_KEY);
    if (!saved) {
        panelPositionModal.style.display = 'flex';
    } else {
        ctrlStart.classList.add('start-pulse');
    }
}

// UI TOUR BUTTONS
tourNextBtn.addEventListener('click', nextUITourStep);
tourStopBtn.addEventListener('click', stopUITour);
tourExitBtn.addEventListener('click', exitUITour);

tourVoiceToggleBtn.addEventListener('click', () => {
    guidedTourVoiceEnabled = !guidedTourVoiceEnabled;
    if (guidedTourVoiceEnabled) {
        tourVoiceIcon.textContent = "mic";
        saveTourVoice("on");
    } else {
        tourVoiceIcon.textContent = "mic_off";
        saveTourVoice("off");
        window.speechSynthesis.cancel();
    }
});

// PANEL POSITION MODAL BUTTONS
panelLeftBtn.addEventListener('click', () => {
    savePanelPosition("left");
    panelPositionModal.style.display = 'none';
    ctrlStart.classList.add('start-pulse');
});

panelRightBtn.addEventListener('click', () => {
    savePanelPosition("right");
    panelPositionModal.style.display = 'none';
    ctrlStart.classList.add('start-pulse');
});
