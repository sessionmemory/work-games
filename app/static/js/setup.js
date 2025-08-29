// Game Setup JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const startGameBtn = document.getElementById('start-game');
    const createSampleBtn = document.getElementById('create-sample');
    const testQuestionBtn = document.getElementById('test-question');
    const playersTextarea = document.getElementById('players');
    const gameModeSelect = document.getElementById('game-mode');
    const includeFakesCheckbox = document.getElementById('include-fakes');

    // Start Game
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            const playersText = playersTextarea.value.trim();
            if (!playersText) {
                showMessage('Please add at least one player name!', 'error');
                return;
            }

            const players = playersText.split('\n')
                .map(name => name.trim())
                .filter(name => name.length > 0);

            if (players.length === 0) {
                showMessage('Please add at least one valid player name!', 'error');
                return;
            }

            startGameBtn.disabled = true;
            startGameBtn.textContent = '🎮 Starting Game...';

            // Setup game
            fetch('/api/game/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    players: players
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirect to game with settings
                    const gameMode = gameModeSelect.value;
                    const includeFakes = includeFakesCheckbox.checked;
                    
                    const params = new URLSearchParams({
                        mode: gameMode,
                        fakes: includeFakes
                    });
                    
                    window.location.href = `/game?${params}`;
                } else {
                    showMessage(data.message || 'Failed to start game', 'error');
                    startGameBtn.disabled = false;
                    startGameBtn.textContent = '🚀 Start Game';
                }
            })
            .catch(error => {
                console.error('Error starting game:', error);
                showMessage('Error starting game. Please try again.', 'error');
                startGameBtn.disabled = false;
                startGameBtn.textContent = '🚀 Start Game';
            });
        });
    }

    // Create Sample Data
    if (createSampleBtn) {
        createSampleBtn.addEventListener('click', function() {
            createSampleBtn.disabled = true;
            createSampleBtn.textContent = '📝 Creating...';

            fetch('/api/admin/sample-data', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('Sample data created successfully!', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showMessage('Failed to create sample data', 'error');
                    createSampleBtn.disabled = false;
                    createSampleBtn.textContent = '📝 Create Sample Data';
                }
            })
            .catch(error => {
                console.error('Error creating sample data:', error);
                showMessage('Error creating sample data', 'error');
                createSampleBtn.disabled = false;
                createSampleBtn.textContent = '📝 Create Sample Data';
            });
        });
    }

    // Test Question Preview
    if (testQuestionBtn) {
        testQuestionBtn.addEventListener('click', function() {
            const gameMode = gameModeSelect.value;
            const includeFakes = includeFakesCheckbox.checked;

            fetch('/api/game/question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: gameMode,
                    include_fakes: includeFakes
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showQuestionPreview(data.question);
                } else {
                    showMessage(data.message || 'No questions available', 'error');
                }
            })
            .catch(error => {
                console.error('Error getting test question:', error);
                showMessage('Error loading test question', 'error');
            });
        });
    }
});

function showMessage(message, type) {
    const statusDiv = document.getElementById('status-message');
    if (!statusDiv) return;

    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 4000);
}

function showQuestionPreview(question) {
    let previewText = '';
    
    switch(question.question_type) {
        case 'identify_official':
            previewText = `Preview: Show photo → players guess name/position/state (${question.points} points)`;
            break;
        case 'find_photo':
            previewText = `Preview: Show "${question.official.position} of ${question.official.state}" → players pick correct photo (${question.points} points)`;
            break;
        case 'multiple_choice':
            previewText = `Preview: Show photo → players choose from 4 name options (${question.points} points)`;
            break;
    }
    
    showMessage(previewText, 'success');
}
