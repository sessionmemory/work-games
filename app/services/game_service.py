#!/usr/bin/env python3
"""
Game Service for Guess That Official
Handles game logic, scoring, and session management
"""

import json
import random
import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime


@dataclass
class Official:
    """Represents a government official"""
    id: str
    name: str
    position: str
    state: str
    photo_path: str
    fun_fact: Optional[str] = None
    category: str = "general"
    is_fake: bool = False  # For fake photos that aren't real officials


@dataclass
class Player:
    """Represents a game player"""
    name: str
    score: int = 0
    streak: int = 0
    correct_answers: int = 0
    total_answers: int = 0


@dataclass
class GameQuestion:
    """Represents a single game question"""
    question_type: str  # 'identify_official', 'find_photo', 'multiple_choice'
    official: Official
    options: List[Official] = None  # For multiple choice
    correct_answer: str = ""
    points: int = 10


class GameService:
    """Core game logic and session management"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.officials_file = os.path.join(data_dir, "officials", "officials.json")
        self.officials: List[Official] = []
        self.players: List[Player] = []
        self.current_question: Optional[GameQuestion] = None
        self.question_history: List[GameQuestion] = []
        self.game_active = False
        self.load_officials()
    
    def load_officials(self) -> None:
        """Load officials from JSON file"""
        try:
            if os.path.exists(self.officials_file):
                with open(self.officials_file, 'r') as f:
                    data = json.load(f)
                    self.officials = [Official(**official) for official in data.get('officials', [])]
            else:
                # Create empty officials file
                os.makedirs(os.path.dirname(self.officials_file), exist_ok=True)
                self.save_officials()
        except Exception as e:
            print(f"Error loading officials: {e}")
            self.officials = []
    
    def save_officials(self) -> None:
        """Save officials to JSON file"""
        try:
            os.makedirs(os.path.dirname(self.officials_file), exist_ok=True)
            data = {
                "officials": [asdict(official) for official in self.officials],
                "last_updated": datetime.now().isoformat()
            }
            with open(self.officials_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving officials: {e}")
    
    def add_official(self, name: str, position: str, state: str, photo_path: str, 
                    fun_fact: str = None, category: str = "general", is_fake: bool = False) -> str:
        """Add a new official to the game"""
        official_id = f"{state.lower()}_{position.lower().replace(' ', '_')}_{len(self.officials)}"
        official = Official(
            id=official_id,
            name=name,
            position=position,
            state=state,
            photo_path=photo_path,
            fun_fact=fun_fact,
            category=category,
            is_fake=is_fake
        )
        self.officials.append(official)
        self.save_officials()
        return official_id
    
    def setup_game(self, player_names: List[str]) -> bool:
        """Initialize a new game session"""
        if not self.officials:
            return False
        
        self.players = [Player(name=name) for name in player_names]
        self.question_history = []
        self.current_question = None
        self.game_active = True
        return True
    
    def generate_question(self, question_type: str = "identify_official", 
                         include_fakes: bool = False) -> Optional[GameQuestion]:
        """Generate a new question"""
        if not self.officials:
            return None
        
        # Filter officials based on preferences
        available_officials = self.officials.copy()
        if not include_fakes:
            available_officials = [o for o in available_officials if not o.is_fake]
        
        if not available_officials:
            return None
        
        # Select random official for the question
        official = random.choice(available_officials)
        
        if question_type == "identify_official":
            # Show photo, guess name/position/state
            question = GameQuestion(
                question_type=question_type,
                official=official,
                correct_answer=f"{official.name} - {official.position} of {official.state}",
                points=10
            )
        
        elif question_type == "find_photo":
            # Show name, pick correct photo from options
            other_officials = [o for o in available_officials if o.id != official.id]
            options = [official] + random.sample(other_officials, min(3, len(other_officials)))
            random.shuffle(options)
            
            question = GameQuestion(
                question_type=question_type,
                official=official,
                options=options,
                correct_answer=official.id,
                points=15
            )
        
        elif question_type == "multiple_choice":
            # Show photo, pick from 4 name options
            other_officials = [o for o in available_officials if o.id != official.id]
            wrong_options = random.sample(other_officials, min(3, len(other_officials)))
            all_options = [official] + wrong_options
            random.shuffle(all_options)
            
            question = GameQuestion(
                question_type=question_type,
                official=official,
                options=all_options,
                correct_answer=official.id,
                points=10
            )
        
        self.current_question = question
        return question
    
    def answer_question(self, answer: str, player_name: str) -> Dict[str, Any]:
        """Process an answer and update scores"""
        if not self.current_question or not self.game_active:
            return {"success": False, "message": "No active question"}
        
        # Find player
        player = next((p for p in self.players if p.name == player_name), None)
        if not player:
            return {"success": False, "message": "Player not found"}
        
        # Check answer
        is_correct = False
        if self.current_question.question_type == "identify_official":
            # Flexible matching for identify questions
            answer_lower = answer.lower().strip()
            correct_lower = self.current_question.correct_answer.lower()
            is_correct = (
                self.current_question.official.name.lower() in answer_lower or
                answer_lower in correct_lower
            )
        else:
            # Exact matching for multiple choice/find photo
            is_correct = answer == self.current_question.correct_answer
        
        # Update player stats
        player.total_answers += 1
        
        if is_correct:
            player.correct_answers += 1
            player.streak += 1
            # Base points + streak bonus
            points = self.current_question.points + (player.streak - 1) * 2
            player.score += points
        else:
            player.streak = 0
            points = 0
        
        # Move question to history
        self.question_history.append(self.current_question)
        self.current_question = None
        
        return {
            "success": True,
            "correct": is_correct,
            "points_earned": points,
            "player_score": player.score,
            "streak": player.streak,
            "correct_answer": self.current_question.correct_answer if self.current_question else ""
        }
    
    def get_leaderboard(self) -> List[Dict[str, Any]]:
        """Get current leaderboard"""
        sorted_players = sorted(self.players, key=lambda p: p.score, reverse=True)
        return [
            {
                "name": player.name,
                "score": player.score,
                "streak": player.streak,
                "accuracy": round(player.correct_answers / max(player.total_answers, 1) * 100, 1),
                "correct": player.correct_answers,
                "total": player.total_answers
            }
            for player in sorted_players
        ]
    
    def get_game_stats(self) -> Dict[str, Any]:
        """Get overall game statistics"""
        return {
            "total_officials": len(self.officials),
            "real_officials": len([o for o in self.officials if not o.is_fake]),
            "fake_photos": len([o for o in self.officials if o.is_fake]),
            "questions_asked": len(self.question_history),
            "game_active": self.game_active,
            "players_count": len(self.players)
        }
    
    def end_game(self) -> Dict[str, Any]:
        """End the current game session"""
        self.game_active = False
        final_leaderboard = self.get_leaderboard()
        
        # Game summary
        summary = {
            "final_scores": final_leaderboard,
            "total_questions": len(self.question_history),
            "game_duration": len(self.question_history),  # Simple metric
            "winner": final_leaderboard[0] if final_leaderboard else None
        }
        
        return summary
