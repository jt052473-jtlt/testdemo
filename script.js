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
let uiTourIndex = 0;
let uiTourActive = false;
let voiceModeEnabled = false;
let guidedTourVoiceEnabled = true;

// UI TOUR STEPS
const uiTourSteps = [
    { element: "#nav-tour-btn", text: "This button starts the guided tour to explain the screen and how the assistant works." },
    { element: "#nav-read-btn", text: "This button activates Read Aloud mode so the assistant can speak the questions to you." },
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

// HIPAA CONSENT
startTourBtn.disabled = true;
hipaaConsent.addEventListener('change', () => {
    startTourBtn.disabled = !hipaaConsent.checked;
});

// LANGUAGE SYNC FIX
modalLangSelect.addEventListener('change', () => {
    canvasLangSelect.value = modalLangSelect.value;
});

// EXIT INTRO
exitModalBtn.addEventListener('click', () => {
    introModal.style.display = "none";
});

// START TOUR
startTourBtn.addEventListener('click', () => {
    startUITour();
});

function startUITour() {
    uiTourActive = true;
    uiTourIndex = 0;
    introModal.style.display = "none";
    navTourBtn.classList.add("active-state");
    showUITourStep();
}

// ⭐ SHOW TOUR STEP — WITH LOWERED TOOLTIP + NO CLIPPING
function showUITourStep() {
    const step = uiTourSteps[uiTourIndex];
    if (!step) return endUITour();

    const el = document.querySelector(step.element);
    if (!el) return endUITour();

    const rect = el.getBoundingClientRect();

    // Highlight
    tourHighlight.style.display = "block";
    tourHighlight.style.top = rect.top - 6 + "px";
    tourHighlight.style.left = rect.left - 6 + "px";
    tourHighlight.style.width = rect.width + 12 + "px";
    tourHighlight.style.height = rect.height + 12 + "px";

    // Tooltip
    tourTooltip.style.display = "block";
    tourText.textContent = step.text;

    const tooltipWidth = tourTooltip.offsetWidth;
    const tooltipHeight = tourTooltip.offsetHeight;

    // ⭐ SIDEBAR BUTTONS → SIDE TOOLTIP WITH SAFE VERTICAL POSITION
    if (el.closest('.sidebar')) {
        const sidebarIsRight = sidebar.classList.contains("sidebar-right");

        let topPos = rect.top + rect.height / 2 - tooltipHeight / 2;

        // Prevent clipping at top
        if (topPos < 40) topPos = 40;

        // Prevent clipping at bottom
        const maxBottom = window.innerHeight - tooltipHeight - 40;
        if (topPos > maxBottom) topPos = maxBottom;

        tourTooltip.style.top = topPos + "px";

        if (sidebarIsRight) {
            tourTooltip.style.left = rect.left - tooltipWidth - 14 + "px";
        } else {
            tourTooltip.style.left = rect.right + 14 + "px";
        }
    }

    // ⭐ NON‑SIDEBAR ELEMENTS → NORMAL TOP/BOTTOM LOGIC
    else {
        const screenHeight = window.innerHeight;
        let topPos;

        if (rect.bottom + tooltipHeight > screenHeight - 40) {
            topPos = rect.top - tooltipHeight - 10;
        } else {
            topPos = rect.bottom + 12;
        }

        if (topPos < 40) topPos = 40;

        tourTooltip.style.top = topPos + "px";
        tourTooltip.style.left = rect.left + "px";
    }
}

// NEXT
tourNextBtn.addEventListener('click', () => {
    uiTourIndex++;
    if (uiTourIndex >= uiTourSteps.length) endUITour();
    else showUITourStep();
});

// STOP / EXIT
tourStopBtn.addEventListener('click', endUITour);
tourExitBtn.addEventListener('click', endUITour);

function endUITour() {
    uiTourActive = false;
    tourHighlight.style.display = "none";
    tourTooltip.style.display = "none";
    navTourBtn.classList.remove("active-state");
}

// SETTINGS
settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = "flex";
    updatePanelButtons();
});

settingsCloseBtn.addEventListener('click', () => {
    settingsModal.style.display = "none";
});

// ⭐ PANEL POSITION SWITCHING + TOP CONFIG SWITCHING + BUTTON COLOR UPDATE
function updatePanelButtons() {
    if (sidebar.classList.contains("sidebar-left")) {
        settingsPanelLeft.style.background = "#000";
        settingsPanelLeft.style.color = "#fff";

        settingsPanelRight.style.background = "#fff";
        settingsPanelRight.style.color = "#000";
    } else {
        settingsPanelRight.style.background = "#000";
        settingsPanelRight.style.color = "#fff";

        settingsPanelLeft.style.background = "#fff";
        settingsPanelLeft.style.color = "#000";
    }
}

settingsPanelLeft.addEventListener('click', () => {
    sidebar.classList.remove("sidebar-right");
    sidebar.classList.add("sidebar-left");

    const topConfig = document.querySelector(".top-config");
    topConfig.classList.remove("top-left");
    topConfig.classList.add("top-right");

    updatePanelButtons();
});

settingsPanelRight.addEventListener('click', () => {
    sidebar.classList.remove("sidebar-left");
    sidebar.classList.add("sidebar-right");

    const topConfig = document.querySelector(".top-config");
    topConfig.classList.remove("top-right");
    topConfig.classList.add("top-left");

    updatePanelButtons();
});

// TOUR VOICE
settingsTourVoiceOff.addEventListener('click', () => {
    guidedTourVoiceEnabled = false;
    tourVoiceIcon.textContent = "mic_off";
});

settingsTourVoiceOn.addEventListener('click', () => {
    guidedTourVoiceEnabled = true;
    tourVoiceIcon.textContent = "mic";
});

// MIC BUTTON
micBtn.addEventListener('click', () => {
    if (!voiceModeEnabled) {
        micBtn.classList.add("mic-red");
        micLock.style.display = "inline-block";
        voiceModeEnabled = true;
    } else {
        micBtn.classList.remove("mic-red", "mic-teal");
        micLock.style.display = "none";
        voiceModeEnabled = false;
    }
});

// START DEMO
ctrlStart.addEventListener('click', () => {
    ctrlStart.classList.add("start-pulse");
    currentStepIndex = 0;
    showQuestion();
});

// SHOW QUESTION
function showQuestion() {
    const workflow = intakeWorkflows[currentFormType];
    if (!workflow) return;

    questionDisplay.textContent = workflow[currentStepIndex];
    stepIndicator.style.display = "inline-block";
    stepIndicator.textContent = `Step ${currentStepIndex + 1} of ${workflow.length}`;
}

// PAUSE
ctrlPause.addEventListener('click', () => {
    questionDisplay.textContent = "(Paused)";
});

// SKIP
ctrlSkip.addEventListener('click', () => {
    const workflow = intakeWorkflows[currentFormType];
    if (currentStepIndex < workflow.length - 1) {
        currentStepIndex++;
        showQuestion();
    }
});

// REPEAT
ctrlRepeat.addEventListener('click', showQuestion);

// FINISH
ctrlFinish.addEventListener('click', () => {
    questionDisplay.textContent = "Thank you. Your intake session is complete.";
});

// RESET
ctrlReset.addEventListener('click', () => {
    currentStepIndex = 0;
    showQuestion();
});

