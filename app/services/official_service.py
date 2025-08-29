#!/usr/bin/env python3
"""
Official Service for managing government officials data
"""

import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from werkzeug.utils import secure_filename
from PIL import Image


class OfficialService:
    """Service for managing officials and their photos"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.photos_dir = os.path.join(data_dir, "photos")
        self.officials_dir = os.path.join(data_dir, "officials")
        self.ensure_directories()
    
    def ensure_directories(self) -> None:
        """Ensure required directories exist"""
        os.makedirs(self.photos_dir, exist_ok=True)
        os.makedirs(self.officials_dir, exist_ok=True)
    
    def save_photo(self, photo_file, filename: str) -> str:
        """Save and optimize uploaded photo"""
        # Secure the filename
        filename = secure_filename(filename)
        if not filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            filename += '.jpg'
        
        photo_path = os.path.join(self.photos_dir, filename)
        
        # Save and optimize the image
        try:
            # Open and process image
            image = Image.open(photo_file)
            
            # Convert to RGB if needed
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Resize if too large (max 800px width, maintain aspect ratio)
            if image.width > 800:
                ratio = 800 / image.width
                new_height = int(image.height * ratio)
                image = image.resize((800, new_height), Image.Resampling.LANCZOS)
            
            # Save optimized image
            image.save(photo_path, 'JPEG', quality=85, optimize=True)
            
            # Return relative path for storage
            return f"photos/{filename}"
        
        except Exception as e:
            print(f"Error processing photo: {e}")
            # Fallback: save original file
            photo_file.save(photo_path)
            return f"photos/{filename}"
    
    def get_sample_officials(self) -> List[Dict[str, Any]]:
        """Get sample officials data for initial setup"""
        return [
            {
                "id": "il_sos",
                "name": "Alexi Giannoulias",
                "position": "Secretary of State",
                "state": "Illinois",
                "photo_path": "photos/alexi_giannoulias.jpg",
                "fun_fact": "Former professional basketball player turned politician",
                "category": "secretary_of_state",
                "is_fake": False
            },
            {
                "id": "ca_sos", 
                "name": "Shirley Weber",
                "position": "Secretary of State",
                "state": "California",
                "photo_path": "photos/shirley_weber.jpg",
                "fun_fact": "First African American to serve as California Secretary of State",
                "category": "secretary_of_state",
                "is_fake": False
            },
            {
                "id": "tx_sos",
                "name": "Jane Nelson",
                "position": "Secretary of State", 
                "state": "Texas",
                "photo_path": "photos/jane_nelson.jpg",
                "fun_fact": "Former state senator with 30+ years of experience",
                "category": "secretary_of_state",
                "is_fake": False
            },
            {
                "id": "ny_gov",
                "name": "Kathy Hochul",
                "position": "Governor",
                "state": "New York", 
                "photo_path": "photos/kathy_hochul.jpg",
                "fun_fact": "First female governor of New York",
                "category": "governor",
                "is_fake": False
            },
            {
                "id": "fl_gov",
                "name": "Ron DeSantis", 
                "position": "Governor",
                "state": "Florida",
                "photo_path": "photos/ron_desantis.jpg",
                "fun_fact": "Former Navy JAG officer and congressman",
                "category": "governor",
                "is_fake": False
            },
            {
                "id": "fake_person_1",
                "name": "Bob Johnson",
                "position": "Definitely Not An Official",
                "state": "Nowhere",
                "photo_path": "photos/fake_bob.jpg",
                "fun_fact": "This is just some random guy from stock photos",
                "category": "fake",
                "is_fake": True
            }
        ]
    
    def create_sample_data(self) -> bool:
        """Create sample officials data file"""
        try:
            officials_file = os.path.join(self.officials_dir, "officials.json")
            sample_data = {
                "officials": self.get_sample_officials(),
                "created": datetime.now().isoformat(),
                "version": "1.0"
            }
            
            os.makedirs(os.path.dirname(officials_file), exist_ok=True)
            with open(officials_file, 'w') as f:
                json.dump(sample_data, f, indent=2)
            
            return True
        except Exception as e:
            print(f"Error creating sample data: {e}")
            return False
    
    def get_categories(self) -> List[str]:
        """Get all available categories"""
        # This would read from the game service's officials
        # For now, return common categories
        return ["secretary_of_state", "governor", "senator", "mayor", "fake", "general"]
    
    def get_states(self) -> List[str]:
        """Get all US states and territories"""
        return [
            "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
            "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
            "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
            "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
            "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
            "New Hampshire", "New Jersey", "New Mexico", "New York",
            "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
            "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
            "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
            "West Virginia", "Wisconsin", "Wyoming", "Washington DC",
            "Puerto Rico", "US Virgin Islands"
        ]
    
    def validate_official_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate official data before saving"""
        errors = []
        
        # Required fields
        required_fields = ['name', 'position', 'state']
        for field in required_fields:
            if not data.get(field, '').strip():
                errors.append(f"{field} is required")
        
        # State validation
        if data.get('state') and data['state'] not in self.get_states():
            errors.append("Invalid state")
        
        # Category validation
        if data.get('category') and data['category'] not in self.get_categories():
            errors.append("Invalid category")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
