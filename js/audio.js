// Mapping of emotes to audio element IDs
const emoteToAudio = {
    '✊': 'audio_fist',
    '👍': 'audio_thumbsup',
    '👎': 'audio_thumbsdown',
    '🤏': 'audio_pinch'
};

let currentAudioId = null;

function pauseAllAudio() {
    Object.values(emoteToAudio).forEach(audioId => {
        const audio = document.getElementById(audioId);
        audio.pause();
        audio.currentTime = 0;
    });
}

function setOutcomeAndShowButton() {
    const predictElement = document.getElementById('predict');
    const playButton = document.getElementById('playButton');
    const outcome = predictElement.textContent.trim();

    if (emoteToAudio[outcome]) {
        pauseAllAudio();
        currentAudioId = emoteToAudio[outcome];
        playButton.style.display = 'block';
    } else {
        currentAudioId = null;
        playButton.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');

    playButton.addEventListener('click', () => {
        if (currentAudioId) {
            const audio = document.getElementById(currentAudioId);
            audio.play().catch(error => {
                console.error('Error playing the audio:', error);
            });
        }
    });

    setOutcomeAndShowButton();

    const predictElement = document.getElementById('predict');
    const observer = new MutationObserver(() => {
        setOutcomeAndShowButton();
    });

    observer.observe(predictElement, { characterData: true, childList: true, subtree: true });
});
