#!/usr/bin/env python3
"""
Flask web interface for Guess That Official Game

Team-friendly government official guessing game for corporate compliance meetings.
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
from typing import Dict, Any
import os

from app.services.game_service import GameService
from app.services.official_service import OfficialService

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
app.secret_key = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')

# Initialize services
game_service = GameService()
official_service = OfficialService()


@app.route('/')
def index():
    """Main dashboard - game setup"""
    stats = game_service.get_game_stats()
    return render_template('index.html', stats=stats)


@app.route('/game')
def game():
    """Game play interface"""
    if not game_service.game_active:
        return redirect(url_for('index'))
    
    leaderboard = game_service.get_leaderboard()
    current_question = game_service.current_question
    
    return render_template('game.html', 
                         leaderboard=leaderboard,
                         current_question=current_question,
                         game_stats=game_service.get_game_stats())


@app.route('/admin')
def admin():
    """Admin interface for managing officials"""
    categories = official_service.get_categories()
    states = official_service.get_states()
    return render_template('admin.html', 
                         categories=categories, 
                         states=states,
                         officials=game_service.officials)


@app.route('/photos/<filename>')
def serve_photo(filename):
    """Serve official photos"""
    return send_from_directory('data/photos', filename)


# Game API endpoints
@app.route('/api/game/setup', methods=['POST'])
def setup_game():
    """Setup new game session"""
    data = request.get_json()
    player_names = data.get('players', [])
    
    if not player_names:
        return jsonify({"success": False, "message": "At least one player required"})
    
    success = game_service.setup_game(player_names)
    return jsonify({"success": success})


@app.route('/api/game/question', methods=['POST'])
def new_question():
    """Generate new question"""
    data = request.get_json()
    question_type = data.get('type', 'identify_official')
    include_fakes = data.get('include_fakes', False)
    
    question = game_service.generate_question(question_type, include_fakes)
    
    if not question:
        return jsonify({"success": False, "message": "No officials available"})
    
    # Return question data (excluding correct answer for frontend)
    question_data = {
        "question_type": question.question_type,
        "official": {
            "photo_path": question.official.photo_path,
            "position": question.official.position,
            "state": question.official.state,
            "fun_fact": question.official.fun_fact
        } if question.question_type == "find_photo" else {"photo_path": question.official.photo_path},
        "options": [{"id": o.id, "name": o.name, "photo_path": o.photo_path} for o in question.options] if question.options else None,
        "points": question.points
    }
    
    return jsonify({"success": True, "question": question_data})


@app.route('/api/game/answer', methods=['POST'])
def submit_answer():
    """Submit answer for current question"""
    data = request.get_json()
    answer = data.get('answer', '')
    player_name = data.get('player', '')
    
    result = game_service.answer_question(answer, player_name)
    return jsonify(result)


@app.route('/api/game/leaderboard')
def get_leaderboard():
    """Get current leaderboard"""
    return jsonify(game_service.get_leaderboard())


@app.route('/api/game/end', methods=['POST'])
def end_game():
    """End current game session"""
    summary = game_service.end_game()
    return jsonify(summary)


# Admin API endpoints
@app.route('/api/admin/official', methods=['POST'])
def add_official():
    """Add new official"""
    try:
        # Handle file upload
        photo = request.files.get('photo')
        if not photo:
            return jsonify({"success": False, "message": "Photo required"})
        
        # Save photo
        filename = f"{request.form['state']}_{request.form['position'].replace(' ', '_')}_{request.form['name'].replace(' ', '_')}.jpg"
        photo_path = official_service.save_photo(photo, filename)
        
        # Validate data
        official_data = {
            'name': request.form.get('name', ''),
            'position': request.form.get('position', ''),
            'state': request.form.get('state', ''),
            'fun_fact': request.form.get('fun_fact', ''),
            'category': request.form.get('category', 'general'),
            'is_fake': request.form.get('is_fake') == 'true'
        }
        
        validation = official_service.validate_official_data(official_data)
        if not validation['valid']:
            return jsonify({"success": False, "errors": validation['errors']})
        
        # Add to game service
        official_id = game_service.add_official(
            name=official_data['name'],
            position=official_data['position'],
            state=official_data['state'],
            photo_path=photo_path,
            fun_fact=official_data['fun_fact'],
            category=official_data['category'],
            is_fake=official_data['is_fake']
        )
        
        return jsonify({"success": True, "official_id": official_id})
    
    except Exception as e:
        return jsonify({"success": False, "message": f"Error adding official: {str(e)}"})


@app.route('/api/admin/sample-data', methods=['POST'])
def create_sample_data():
    """Create sample officials data"""
    success = official_service.create_sample_data()
    if success:
        game_service.load_officials()  # Reload officials
    return jsonify({"success": success})


@app.route('/health')
def health():
    """Health check endpoint for Docker"""
    return jsonify({"status": "healthy", "service": "guess-that-official"})


@app.route('/api/status')
def api_status():
    """API status endpoint"""
    return jsonify({
        "status": "active",
        "version": "0.1.0",
        "game": "Guess That Official",
        "endpoints": [
            "/api/status",
            "/api/game/setup",
            "/api/game/question", 
            "/api/game/answer",
            "/api/game/leaderboard",
            "/api/admin/official",
            "/health"
        ]
    })


if __name__ == '__main__':
    # Development server
    app.run(
        debug=True,
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000))
    ) 