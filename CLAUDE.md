# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a react web application used primarily as a static website for f3rva.

## Project Structure

## Development Workflow

### AWS Configuration
- The project uses AWS boto3 with a specific profile named 'ailab'
- Ensure AWS credentials are configured for the 'ailab' profile before running aws-dma.ipynb
- The notebooks connect to AWS Bedrock in the us-east-1 region

### Dependencies
- react
- boto3 (for AWS integration)
- Standard Jupyter notebook environment
- AWS credentials configured for 'ailab' profile

## Code Editing Notes

When modifying react files or components:
- Follow all best practices and standards
- Follow a test-driven-development approach
- Always use descriptive narrative names
- Provide adequate commenting in the code to describe intent, not describe code
