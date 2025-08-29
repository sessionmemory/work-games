#!/usr/bin/env python3
"""
Setup script for [PROJECT_NAME]
"""

from setuptools import setup, find_packages
import os

# Read README for long description
def read_readme():
    with open("README.md", "r", encoding="utf-8") as fh:
        return fh.read()

# Read requirements
def read_requirements():
    with open("requirements.txt", "r", encoding="utf-8") as fh:
        return [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="[PROJECT_NAME]",
    version="0.1.0",
    author="Alex @ Digital Synergy Solutions",
    author_email="alex@digitalsynergysolutions.com",
    description="[BRIEF_DESCRIPTION]",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    url="https://github.com/alexdss/[PROJECT_NAME]",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.11",
    install_requires=read_requirements(),
    entry_points={
        "console_scripts": [
            "[project-name]=[PROJECT_NAME].main:main",
        ],
    },
) 