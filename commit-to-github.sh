#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fantasy Football App - GitHub Commit Helper${NC}"
echo "----------------------------------------"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed.${NC}"
    exit 1
fi

# Check if the directory is a git repository
if [ ! -d .git ]; then
    echo -e "${YELLOW}This directory is not a git repository. Initializing...${NC}"
    git init
    
    # Ask for the GitHub repository URL
    echo -e "${YELLOW}Enter your GitHub repository URL:${NC}"
    read repo_url
    
    if [ -z "$repo_url" ]; then
        echo -e "${RED}No repository URL provided. Exiting.${NC}"
        exit 1
    fi
    
    git remote add origin $repo_url
    echo -e "${GREEN}Repository initialized and remote added.${NC}"
fi

# Stage all files
echo -e "${YELLOW}Staging files...${NC}"
git add .

# Show status
git status

# Ask for commit message
echo -e "${YELLOW}Enter a commit message:${NC}"
read commit_message

if [ -z "$commit_message" ]; then
    commit_message="Update fantasy football app"
fi

# Commit changes
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "$commit_message"

# Push to GitHub
echo -e "${YELLOW}Do you want to push to GitHub? (y/n)${NC}"
read push_choice

if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
    echo -e "${YELLOW}Pushing to GitHub...${NC}"
    git push -u origin main || git push -u origin master
    echo -e "${GREEN}Changes pushed to GitHub!${NC}"
else
    echo -e "${YELLOW}Changes committed locally but not pushed to GitHub.${NC}"
    echo -e "${YELLOW}To push later, run: git push -u origin main${NC}"
fi

echo -e "${GREEN}Done!${NC}" 