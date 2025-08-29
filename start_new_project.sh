#!/bin/bash

# NEW_PROJECT_TEMPLATE Quick Start Script
# Usage: ./start_new_project.sh <project_name> <description>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if project name is provided
if [ $# -lt 1 ]; then
    print_error "Usage: $0 <project_name> [description]"
    echo "Example: $0 youtube-transcriber 'Tool to extract YouTube transcripts'"
    exit 1
fi

PROJECT_NAME="$1"
PROJECT_DESCRIPTION="${2:-A new Python CLI/Flask application}"

# Validate project name (basic check)
if [[ ! "$PROJECT_NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    print_error "Project name should only contain letters, numbers, hyphens, and underscores"
    exit 1
fi

print_status "🚀 Starting new project: $PROJECT_NAME"
print_status "Description: $PROJECT_DESCRIPTION"

# Create project directory
PROJECT_DIR="../$PROJECT_NAME"
if [ -d "$PROJECT_DIR" ]; then
    print_error "Directory $PROJECT_DIR already exists!"
    exit 1
fi

print_status "Creating project directory: $PROJECT_DIR"
cp -r . "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Remove the template-specific files
rm -f start_new_project.sh test_template.py

print_status "Customizing files with project details..."

# Replace placeholders in files
find . -type f \( -name "*.py" -o -name "*.md" -o -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.yml" \) \
    -exec sed -i "s/\[PROJECT_NAME\]/$PROJECT_NAME/g" {} \;

find . -type f \( -name "*.py" -o -name "*.md" -o -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.yml" \) \
    -exec sed -i "s/\[BRIEF_DESCRIPTION\]/$PROJECT_DESCRIPTION/g" {} \;

# Create PLAN.md from template
if [ -f "dev/PLAN.md.template" ]; then
    print_status "Creating development plan..."
    CURRENT_DATE=$(date +"%Y-%m-%d")
    cp "dev/PLAN.md.template" "dev/PLAN-$PROJECT_NAME.md"
    sed -i "s/\[DATE\]/$CURRENT_DATE/g" "dev/PLAN-$PROJECT_NAME.md"
    sed -i "s/\[PROJECT_NAME\]/$PROJECT_NAME/g" "dev/PLAN-$PROJECT_NAME.md"
    sed -i "s/\[BRIEF_DESCRIPTION\]/$PROJECT_DESCRIPTION/g" "dev/PLAN-$PROJECT_NAME.md"
fi

# Initialize git repository
print_status "Initializing git repository..."
git init
git add .
git commit -m "Initial commit: Created $PROJECT_NAME from template

- Set up basic CLI structure with argparse
- Added Flask web interface foundation  
- Configured Docker containerization
- Created development plan template
- Ready for Phase 1 development"

print_success "🎉 Project $PROJECT_NAME created successfully!"
echo
print_status "Next steps:"
echo "  1. cd $PROJECT_NAME"
echo "  2. Edit dev/PLAN-$PROJECT_NAME.md with your specific requirements"
echo "  3. Set up virtual environment: python -m venv venv && source venv/bin/activate"
echo "  4. Install dependencies: pip install -r requirements.txt"
echo "  5. Test CLI: python main.py --help"
echo "  6. Start building your features!"
echo
print_status "Files created:"
echo "  📁 $PROJECT_DIR/"
echo "  📄 dev/PLAN-$PROJECT_NAME.md (your development roadmap)"
echo "  🐍 main.py (CLI interface)"
echo "  🌐 app.py (Flask web interface)"
echo "  🐳 Dockerfile & docker-compose.yml"
echo "  📚 README.md, requirements.txt, and more..."
echo
print_success "Happy coding! 🚀" 