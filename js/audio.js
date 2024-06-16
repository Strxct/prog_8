    // Mapping of emotes to audio element IDs
    const emoteToAudio = {
        '✊': 'audio_fist',
        '👍': 'audio_thumbsup',
        '👎': 'audio_thumbsdown',
        '🤏': 'audio_pinch'
    };

    // Function to set the outcome and show the play button with the corresponding song
    function setOutcomeAndShowButton() {
        const predictElement = document.getElementById('predict');
        const playButton = document.getElementById('playButton');

        // Get the outcome from the predict element
        const outcome = predictElement.textContent;

        // Check if the outcome matches any emote and set the song source
        if (emoteToAudio[outcome]) {
            // Pause all audio elements
            Object.values(emoteToAudio).forEach(audioId => {
                const audioElement = document.getElementById(audioId);
                audioElement.pause();
                audioElement.currentTime = 0;
            });

            // Show the play button
            playButton.style.display = 'block';

            // Add event listener to play the correct audio when the button is clicked
            playButton.onclick = function () {
                const audioElement = document.getElementById(emoteToAudio[outcome]);
                audioElement.play().catch(error => {
                    console.error('Error playing the audio:', error);
                });
            };
        } else {
            // Hide the play button if the outcome does not match any emote
            playButton.style.display = 'none';
        }
    }

    // Ensure the DOM is fully loaded before running the script
    document.addEventListener('DOMContentLoaded', () => {
        setOutcomeAndShowButton();

        // Observe changes in the predict element
        const predictElement = document.getElementById('predict');
        const observer = new MutationObserver(() => {
            setOutcomeAndShowButton();
        });

        // Configure the observer to listen for changes in the text content
        observer.observe(predictElement, { characterData: true, childList: true, subtree: true });
    });