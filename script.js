// DOM ELEMENTS
const introModal = document.getElementById('intro-modal');
const hipaaConsent = document.getElementById('hipaa-consent-chk');
const startTourBtn = document.getElementById('start-tour-btn');
const exitModalBtn = document.getElementById('exit-modal-btn');

const messageInput = document.getElementById('message-input');
const micBtn = document.getElementById('mic-btn');
const mainPromptHeader = document.getElementById('main-prompt-header');
const stepIndicator = document.getElementById('step-indicator');

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
    ]
};

let currentStepIndex = -1;
let currentFormType = "admission";
let tourActive = false;
let collectedAnswers = [];

// COMPLIANCE GATE
startTourBtn.disabled = true;

hipaaConsent.addEventListener('change', () => {
    startTourBtn.disabled = !hipaaConsent.checked;
});

modalLangSelect.addEventListener('change', () => {
    canvasLangSelect.value = modalLangSelect.value;
});

// TOUR ENGINE
function updatePromptDisplay() {
    const activeQuestions = intakeWorkflows[currentFormType];

    if (currentStepIndex >= 0 && currentStepIndex < activeQuestions.length) {
        mainPromptHeader.textContent = activeQuestions[currentStepIndex];
        stepIndicator.style.display = 'block';
        stepIndicator.textContent = `Step ${currentStepIndex + 1} of ${activeQuestions.length}`;

        setMicState(true);
        ctrlStart.classList.add('active-state');
        ctrlPause.classList.remove('active-state');

    } else if (currentStepIndex >= activeQuestions.length) {
        mainPromptHeader.textContent = "Thank you! Clinical intake steps are completed successfully.";
        stepIndicator.style.display = 'none';
        endTourProcessingStates();
        generateFhirQuestionnaireResponse();
    }
}

function initiateTourFlow() {
    tourActive = true;
    currentStepIndex = 0;
    collectedAnswers = [];

    introModal.style.display = 'none';
    navTourBtn.classList.add('active-state');

    messageInput.value = "";
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
}

// EVENT LISTENERS — TOUR
startTourBtn.addEventListener('click', initiateTourFlow);
navTourBtn.addEventListener('click', initiateTourFlow);

exitModalBtn.addEventListener('click', () => {
    introModal.style.display = 'none';
    endTourProcessingStates();
    mainPromptHeader.textContent = "Hi, what should we dive into today?";
});

canvasFormSelect.addEventListener('change', () => {
    currentFormType = canvasFormSelect.value;

    if (tourActive) {
        currentStepIndex = 0;
        collectedAnswers = [];
        updatePromptDisplay();
    }
});

// SIDEBAR BUTTONS
ctrlStart.addEventListener('click', () => {
    setMicState(true);
    ctrlStart.classList.add('active-state');
    ctrlPause.classList.remove('active-state');
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
        mainPromptHeader.style.opacity = 0.3;
        setTimeout(() => mainPromptHeader.style.opacity = 1, 200);
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
    } else {
        currentStepIndex = 0;
        updatePromptDisplay();
    }
});

navReadBtn.addEventListener('click', () => {
    navReadBtn.classList.toggle('active-state');
});

// MIC STATE
function setMicState(active) {
    if (active) {
        micBtn.classList.add('flicker');
        ctrlStart.classList.add('active-state');
        ctrlPause.classList.remove('active-state');
    } else {
        micBtn.classList.remove('flicker');
        ctrlPause.classList.add('active-state');
        ctrlStart.classList.remove('active-state');
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
        setMicState(false);
    };
} else {
    console.warn('Web Speech API not supported in this browser.');
}

micBtn.addEventListener('click', () => {
    if (!recognition) {
        alert('Voice input is not supported in this browser.');
        return;
    }

    if (micBtn.classList.contains('flicker')) {
        recognition.stop();
        setMicState(false);
    } else {
        setMicState(true);
        recognition.start();
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
