# Push to GitHub

Your code has been committed locally. Follow these steps to push to GitHub:

## Option 1: Using GitHub CLI (if installed)

If you have GitHub CLI installed, run:

```bash
cd /Users/benburkle/my-nextjs-app
gh repo create my-nextjs-app --public --source=. --remote=origin --push
```

## Option 2: Manual Setup

### Step 1: Create a new repository on GitHub

1. Go to https://github.com/new
2. Repository name: `my-nextjs-app` (or any name you prefer)
3. Choose Public or Private
4. **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Step 2: Add remote and push

After creating the repository, GitHub will show you commands. Use these:

```bash
cd /Users/benburkle/my-nextjs-app

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/my-nextjs-app.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/my-nextjs-app.git

git branch -M main
git push -u origin main
```

## Done!

Your code will now be on GitHub. You can view it at:
`https://github.com/YOUR_USERNAME/my-nextjs-app`
