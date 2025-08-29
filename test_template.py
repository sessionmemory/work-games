#!/usr/bin/env python3
"""
Test script to validate the NEW_PROJECT_TEMPLATE

Run this to make sure everything is working correctly.
"""

import os
import sys
import subprocess
from pathlib import Path


def test_template_structure():
    """Test that all expected files exist"""
    expected_files = [
        'main.py',
        'app.py',  
        'requirements.txt',
        'README.md',
        'LICENSE',
        '.gitignore',
        'Dockerfile',
        'docker-compose.yml',
        'setup.py',
        'dev/PLAN.md.template',
        'templates/index.html',
        'static/css/style.css',
        'static/js/app.js'
    ]
    
    print("🔍 Checking template structure...")
    missing_files = []
    
    for file_path in expected_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing files: {', '.join(missing_files)}")
        return False
    else:
        print("✅ All expected files present!")
        return True


def test_python_syntax():
    """Test that Python files have valid syntax"""
    python_files = ['main.py', 'app.py', 'setup.py']
    
    print("\n🐍 Checking Python syntax...")
    
    for py_file in python_files:
        try:
            with open(py_file, 'r') as f:
                compile(f.read(), py_file, 'exec')
            print(f"✅ {py_file} - syntax OK")
        except SyntaxError as e:
            print(f"❌ {py_file} - syntax error: {e}")
            return False
        except Exception as e:
            print(f"⚠️  {py_file} - error: {e}")
    
    return True


def test_cli_basic():
    """Test that main.py runs without errors"""
    print("\n🖥️  Testing CLI interface...")
    
    try:
        result = subprocess.run([
            sys.executable, 'main.py', '--help'
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ CLI help command works!")
            return True
        else:
            print(f"❌ CLI failed with return code {result.returncode}")
            print(f"Error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ CLI command timed out")
        return False
    except Exception as e:
        print(f"❌ CLI test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("🚀 Testing NEW_PROJECT_TEMPLATE")
    print("=" * 40)
    
    all_tests_passed = True
    
    # Test structure
    if not test_template_structure():
        all_tests_passed = False
    
    # Test Python syntax
    if not test_python_syntax():
        all_tests_passed = False
    
    # Test CLI
    if not test_cli_basic():
        all_tests_passed = False
    
    print("\n" + "=" * 40)
    if all_tests_passed:
        print("🎉 All tests passed! Template is ready to use.")
        print("\nTo use this template:")
        print("1. Copy this folder to your new project directory")
        print("2. Rename placeholders like [PROJECT_NAME]")
        print("3. Create your PLAN.md from the template")
        print("4. Start building!")
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        sys.exit(1)


if __name__ == "__main__":
    main() 