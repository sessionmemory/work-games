// Game Play JavaScript

let currentQuestion = null;
let questionCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    const nextQuestionBtn = document.getElementById('next-question');
    const revealAnswerBtn = document.getElementById('reveal-answer');
    const endGameBtn = document.getElementById('end-game');
    const submitAnswerBtn = document.getElementById('submit-answer');
    const wrongAnswerBtn = document.getElementById('wrong-answer');

    // Next Question
    nextQuestionBtn.addEventListener('click', function() {
        loadNewQuestion();
    });

    // Reveal Answer
    revealAnswerBtn.addEventListener('click', function() {
        revealCurrentAnswer();
    });

    // End Game
    endGameBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to end the game?')) {
            endCurrentGame();
        }
    });

    // Submit Correct Answer
    if (submitAnswerBtn) {
        submitAnswerBtn.addEventListener('click', function() {
            const player = document.getElementById('answering-player').value;
            const answer = document.getElementById('answer-text').value;
            submitAnswer(answer, player, true);
        });
    }

    // Submit Wrong Answer
    if (wrongAnswerBtn) {
        wrongAnswerBtn.addEventListener('click', function() {
            const player = document.getElementById('answering-player').value;
            submitAnswer('', player, false);
        });
    }

    // Enter key for answer submission
    const answerInput = document.getElementById('answer-text');
    if (answerInput) {
        answerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitAnswerBtn.click();
            }
        });
    }
});

function loadNewQuestion() {
    const nextBtn = document.getElementById('next-question');
    nextBtn.disabled = true;
    nextBtn.textContent = '🎲 Loading...';

    fetch('/api/game/question', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: gameMode || 'identify_official',
            include_fakes: includeFakes || false
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentQuestion = data.question;
            displayQuestion(data.question);
            questionCount++;
            document.getElementById('question-count').textContent = questionCount;
        } else {
            showMessage(data.message || 'Failed to load question', 'error');
        }
        
        nextBtn.disabled = false;
        nextBtn.textContent = '🎲 Next Question';
    })
    .catch(error => {
        console.error('Error loading question:', error);
        showMessage('Error loading question', 'error');
        nextBtn.disabled = false;
        nextBtn.textContent = '🎲 Next Question';
    });
}

function displayQuestion(question) {
    // Hide all sections first
    document.getElementById('photo-display').style.display = 'none';
    document.getElementById('options-container').style.display = 'none';
    document.getElementById('answer-input').style.display = 'none';
    document.getElementById('answer-reveal').style.display = 'none';

    const questionText = document.getElementById('question-text');
    const photoImg = document.getElementById('official-photo');

    switch(question.question_type) {
        case 'identify_official':
            questionText.textContent = 'Who is this official? (Name, Position, State)';
            photoImg.src = `/${question.official.photo_path}`;
            document.getElementById('photo-display').style.display = 'block';
            document.getElementById('answer-input').style.display = 'block';
            document.getElementById('answer-text').value = '';
            document.getElementById('answer-text').focus();
            break;

        case 'find_photo':
            questionText.textContent = `Find the photo of: ${question.official.position} of ${question.official.state}`;
            displayPhotoOptions(question.options);
            break;

        case 'multiple_choice':
            questionText.textContent = 'Who is this official?';
            photoImg.src = `/${question.official.photo_path}`;
            document.getElementById('photo-display').style.display = 'block';
            displayNameOptions(question.options);
            break;
    }
}

function displayPhotoOptions(options) {
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    container.style.display = 'block';

    options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-card';
        optionDiv.dataset.optionId = option.id;
        
        optionDiv.innerHTML = `
            <img src="/${option.photo_path}" alt="Option ${index + 1}">
            <div>${String.fromCharCode(65 + index)}</div>
        `;
        
        optionDiv.addEventListener('click', function() {
            selectPhotoOption(option.id, optionDiv);
        });
        
        container.appendChild(optionDiv);
    });
}

function displayNameOptions(options) {
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    container.style.display = 'block';

    options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-card';
        optionDiv.dataset.optionId = option.id;
        
        optionDiv.innerHTML = `
            <div class="option-letter">${String.fromCharCode(65 + index)}</div>
            <div class="option-name">${option.name}</div>
        `;
        
        optionDiv.addEventListener('click', function() {
            selectNameOption(option.id, optionDiv);
        });
        
        container.appendChild(optionDiv);
    });
}

function selectPhotoOption(optionId, element) {
    // Clear previous selections
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    const player = document.getElementById('answering-player').value;
    submitAnswer(optionId, player, true);
}

function selectNameOption(optionId, element) {
    // Clear previous selections
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    element.classList.add('selected');
    
    const player = document.getElementById('answering-player').value;
    submitAnswer(optionId, player, true);
}

function submitAnswer(answer, player, isCorrect) {
    if (!player) {
        showMessage('Please select which player answered!', 'error');
        return;
    }

    fetch('/api/game/answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            answer: answer,
            player: player
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            handleAnswerResult(data);
            updateLeaderboard();
        } else {
            showMessage(data.message || 'Error submitting answer', 'error');
        }
    })
    .catch(error => {
        console.error('Error submitting answer:', error);
        showMessage('Error submitting answer', 'error');
    });
}

function handleAnswerResult(result) {
    const resultMessage = result.correct 
        ? `🎉 Correct! +${result.points_earned} points` 
        : `❌ Wrong answer`;
    
    if (result.streak > 1) {
        resultMessage += ` (🔥 ${result.streak} streak!)`;
    }

    showMessage(resultMessage, result.correct ? 'success' : 'error');
    
    // Show correct answer
    setTimeout(() => {
        revealCurrentAnswer();
    }, 2000);
}

function revealCurrentAnswer() {
    if (!currentQuestion) return;

    const revealDiv = document.getElementById('answer-reveal');
    const correctAnswerDiv = document.getElementById('correct-answer-text');
    const funFactDiv = document.getElementById('fun-fact');

    let answerText = '';
    
    switch(currentQuestion.question_type) {
        case 'identify_official':
            answerText = `${currentQuestion.official.name} - ${currentQuestion.official.position} of ${currentQuestion.official.state}`;
            break;
        case 'find_photo':
        case 'multiple_choice':
            answerText = `${currentQuestion.official.name} - ${currentQuestion.official.position} of ${currentQuestion.official.state}`;
            break;
    }

    correctAnswerDiv.textContent = answerText;
    
    if (currentQuestion.official.fun_fact) {
        funFactDiv.innerHTML = `<strong>💡 Fun Fact:</strong> ${currentQuestion.official.fun_fact}`;
        funFactDiv.style.display = 'block';
    } else {
        funFactDiv.style.display = 'none';
    }

    revealDiv.style.display = 'block';
    
    // Hide answer input
    document.getElementById('answer-input').style.display = 'none';
    document.getElementById('options-container').style.display = 'none';
}

function updateLeaderboard() {
    fetch('/api/game/leaderboard')
        .then(response => response.json())
        .then(players => {
            const leaderboardDiv = document.getElementById('leaderboard');
            
            leaderboardDiv.innerHTML = players.map(player => `
                <div class="player-score">
                    <div class="player-name">${player.name}</div>
                    <div class="player-stats">
                        <span class="score">${player.score} pts</span>
                        ${player.streak > 1 ? `<span class="streak">🔥 ${player.streak}</span>` : ''}
                        <span class="accuracy">${player.accuracy}%</span>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error updating leaderboard:', error);
        });
}

function endCurrentGame() {
    fetch('/api/game/end', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        showGameOverModal(data);
    })
    .catch(error => {
        console.error('Error ending game:', error);
        showMessage('Error ending game', 'error');
    });
}

function showGameOverModal(gameData) {
    const modal = document.getElementById('game-over-modal');
    const resultsDiv = document.getElementById('final-results');
    
    let resultsHTML = '<h3>🏆 Final Scores</h3>';
    
    if (gameData.final_scores && gameData.final_scores.length > 0) {
        resultsHTML += '<div class="final-leaderboard">';
        gameData.final_scores.forEach((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
            resultsHTML += `
                <div class="final-player-score">
                    <span class="medal">${medal}</span>
                    <span class="name">${player.name}</span>
                    <span class="final-score">${player.score} points</span>
                    <span class="final-accuracy">(${player.accuracy}% accuracy)</span>
                </div>
            `;
        });
        resultsHTML += '</div>';
        
        if (gameData.winner) {
            resultsHTML += `<div class="winner-announcement">🎉 Winner: ${gameData.winner.name}! 🎉</div>`;
        }
    }
    
    resultsHTML += `<p class="game-summary">Total Questions: ${gameData.total_questions}</p>`;
    
    resultsDiv.innerHTML = resultsHTML;
    modal.style.display = 'flex';
    
    // New Game button
    document.getElementById('new-game').addEventListener('click', function() {
        window.location.href = '/';
    });
}

function showMessage(message, type) {
    // Create temporary message if status div doesn't exist
    let statusDiv = document.getElementById('status-message');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'status-message';
        document.body.appendChild(statusDiv);
    }

    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 4000);
}
