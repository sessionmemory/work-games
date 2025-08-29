#!/usr/bin/env python3
"""
Main entry point for [PROJECT_NAME]

Started as CLI application, designed to evolve into Flask web app.
Built by Alex @ Digital Synergy Solutions
"""

import argparse
import sys
from typing import Optional


def main() -> None:
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="[PROJECT_NAME] - [BRIEF_DESCRIPTION]",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "--version", 
        action="version", 
        version="%(prog)s 0.1.0"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose output"
    )
    
    # Add your CLI commands here
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Example command
    hello_parser = subparsers.add_parser("hello", help="Say hello")
    hello_parser.add_argument("name", nargs="?", default="World", help="Name to greet")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Route to command handlers
    if args.command == "hello":
        print(f"Hello, {args.name}!")
    
    # TODO: Add Flask web interface when ready
    # if args.command == "web":
    #     from app import app
    #     app.run(debug=True, host='0.0.0.0', port=5000)


if __name__ == "__main__":
    main() 