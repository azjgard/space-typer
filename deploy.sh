# Start off `main` and make sure it's up to date
git checkout main
git pull
git push

# Get the last commit message for later user
MSG="$(git log -1 --pretty=%B)"

# Build the site and checkout the deployment branch
npm run build
git checkout deploy
git pull

# Move dist files to root
rm -rf assets
mv dist/* .

# Commit latest build at root and push to GitHub (which then auto-deploys to pages)
git add .
git commit -m "deployment: $MSG"
git push

# Checkout main again
git checkout main
