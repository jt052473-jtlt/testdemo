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
    canvasLangSelect.value
