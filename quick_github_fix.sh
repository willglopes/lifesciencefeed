#!/bin/bash
# Quick GitHub Authentication Fix Script

echo "🔧 GitHub Sync Fix - Quick Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get user input
get_user_input() {
    echo -e "${BLUE}Please provide the following information:${NC}"
    
    read -p "GitHub Username: " GITHUB_USERNAME
    read -p "GitHub Email: " GITHUB_EMAIL
    read -p "Repository Name (default: lifesciencefeed): " REPO_NAME
    
    # Set default repo name if empty
    if [ -z "$REPO_NAME" ]; then
        REPO_NAME="lifesciencefeed"
    fi
    
    echo -e "${YELLOW}You'll need a GitHub Personal Access Token.${NC}"
    echo -e "${YELLOW}Get one at: https://github.com/settings/tokens${NC}"
    echo -e "${YELLOW}Make sure to select 'repo' scope!${NC}"
    echo ""
    read -p "Press Enter when you have your token ready..."
}

# Function to configure git
configure_git() {
    echo -e "${BLUE}Configuring Git...${NC}"
    
    git config --global user.name "$GITHUB_USERNAME"
    git config --global user.email "$GITHUB_EMAIL"
    git config --global credential.helper store
    git config --global init.defaultBranch main
    
    echo -e "${GREEN}✅ Git configured successfully${NC}"
}

# Function to initialize repository
init_repository() {
    echo -e "${BLUE}Initializing repository...${NC}"
    
    # Check if already a git repo
    if [ ! -d ".git" ]; then
        git init
        echo -e "${GREEN}✅ Git repository initialized${NC}"
    else
        echo -e "${YELLOW}⚠️  Git repository already exists${NC}"
    fi
    
    # Add all files
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        echo -e "${YELLOW}⚠️  No changes to commit${NC}"
    else
        git commit -m "Initial commit - medical news website"
        echo -e "${GREEN}✅ Initial commit created${NC}"
    fi
}

# Function to setup remote
setup_remote() {
    echo -e "${BLUE}Setting up GitHub remote...${NC}"
    
    # Remove existing remote if it exists
    if git remote get-url origin >/dev/null 2>&1; then
        git remote remove origin
        echo -e "${YELLOW}⚠️  Removed existing remote${NC}"
    fi
    
    # Add new remote
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo -e "${GREEN}✅ Remote added: https://github.com/$GITHUB_USERNAME/$REPO_NAME.git${NC}"
}

# Function to create GitHub repository
create_github_repo() {
    echo -e "${BLUE}Creating GitHub repository...${NC}"
    
    if command_exists gh; then
        echo -e "${YELLOW}Using GitHub CLI to create repository...${NC}"
        gh repo create "$REPO_NAME" --public --description "Medical news website built with Next.js and Strapi"
        echo -e "${GREEN}✅ Repository created with GitHub CLI${NC}"
    else
        echo -e "${YELLOW}GitHub CLI not found. Please create repository manually:${NC}"
        echo -e "${YELLOW}1. Go to https://github.com/new${NC}"
        echo -e "${YELLOW}2. Repository name: $REPO_NAME${NC}"
        echo -e "${YELLOW}3. Set to Public${NC}"
        echo -e "${YELLOW}4. Don't initialize with README${NC}"
        echo -e "${YELLOW}5. Click 'Create repository'${NC}"
        echo ""
        read -p "Press Enter after creating the repository..."
    fi
}

# Function to push to GitHub
push_to_github() {
    echo -e "${BLUE}Pushing to GitHub...${NC}"
    
    echo -e "${YELLOW}When prompted for password, use your Personal Access Token!${NC}"
    
    if git push -u origin main; then
        echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
        echo -e "${GREEN}Your repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
    else
        echo -e "${RED}❌ Push failed. Common issues:${NC}"
        echo -e "${RED}1. Wrong Personal Access Token${NC}"
        echo -e "${RED}2. Repository doesn't exist on GitHub${NC}"
        echo -e "${RED}3. Network connectivity issues${NC}"
        echo ""
        echo -e "${YELLOW}Try running: git push -u origin main${NC}"
    fi
}

# Function to test connection
test_connection() {
    echo -e "${BLUE}Testing GitHub connection...${NC}"
    
    if git ls-remote origin >/dev/null 2>&1; then
        echo -e "${GREEN}✅ GitHub connection successful!${NC}"
        return 0
    else
        echo -e "${RED}❌ GitHub connection failed${NC}"
        return 1
    fi
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}🎉 GitHub Setup Complete!${NC}"
    echo -e "${GREEN}=========================${NC}"
    echo ""
    echo -e "${BLUE}Your repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
    echo ""
    echo -e "${YELLOW}Next steps for Vercel deployment:${NC}"
    echo -e "${YELLOW}1. Go to https://vercel.com${NC}"
    echo -e "${YELLOW}2. Sign up with GitHub${NC}"
    echo -e "${YELLOW}3. Import your repository${NC}"
    echo -e "${YELLOW}4. Add environment variable: NEXT_PUBLIC_STRAPI_URL${NC}"
    echo -e "${YELLOW}5. Deploy!${NC}"
    echo ""
    echo -e "${BLUE}VS Code should now sync properly with GitHub!${NC}"
}

# Function to install GitHub CLI
install_github_cli() {
    echo -e "${BLUE}Installing GitHub CLI...${NC}"
    
    if command_exists curl; then
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update
        sudo apt install gh -y
        
        echo -e "${GREEN}✅ GitHub CLI installed${NC}"
        echo -e "${YELLOW}Please run: gh auth login${NC}"
        echo -e "${YELLOW}Then run this script again${NC}"
    else
        echo -e "${RED}❌ curl not found. Please install curl first${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Checking current directory...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json not found. Are you in your Next.js project directory?${NC}"
        echo -e "${YELLOW}Please navigate to your project directory and run this script again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Found package.json - you're in the right directory${NC}"
    echo ""
    
    # Get user input
    get_user_input
    
    # Configure git
    configure_git
    
    # Initialize repository
    init_repository
    
    # Setup remote
    setup_remote
    
    # Ask about creating repository
    echo ""
    read -p "Do you want to create the GitHub repository automatically? (y/n): " CREATE_REPO
    
    if [[ $CREATE_REPO =~ ^[Yy]$ ]]; then
        if ! command_exists gh; then
            echo -e "${YELLOW}GitHub CLI not found. Installing...${NC}"
            install_github_cli
            exit 0
        fi
        
        # Login to GitHub CLI if not already logged in
        if ! gh auth status >/dev/null 2>&1; then
            echo -e "${YELLOW}Please login to GitHub CLI:${NC}"
            gh auth login
        fi
        
        create_github_repo
    else
        echo -e "${YELLOW}Please create the repository manually at:${NC}"
        echo -e "${YELLOW}https://github.com/new${NC}"
        echo ""
        read -p "Press Enter after creating the repository..."
    fi
    
    # Test connection
    if test_connection; then
        # Push to GitHub
        push_to_github
        
        # Show next steps
        show_next_steps
    else
        echo -e "${RED}❌ Connection test failed. Please check:${NC}"
        echo -e "${RED}1. Repository exists on GitHub${NC}"
        echo -e "${RED}2. Personal Access Token is correct${NC}"
        echo -e "${RED}3. Token has 'repo' permissions${NC}"
    fi
}

# Run main function
main

