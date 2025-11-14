# Publishing Guide

This document explains how the automated publishing works for svelicon.

## 🚀 Automatic Publishing

The package is automatically published to NPM when:

1. ✅ All tests pass
2. ✅ Security checks pass  
3. ✅ Code is pushed to `main` branch
4. ✅ Version in `package.json` is new (not already published)

## 📦 Release Process

### Option 1: Using NPM Scripts (Recommended)

```bash
# Patch release (1.0.0 → 1.0.1)
npm run release

# Minor release (1.0.0 → 1.1.0)
npm run release:minor

# Major release (1.0.0 → 2.0.0)
npm run release:major

# Beta release (1.0.0 → 1.0.1-beta.0)
npm run release:beta
```

These scripts will:
1. Run tests
2. Bump version in `package.json`
3. Create a git commit with the version
4. Push to `main` branch
5. Trigger automatic publishing

### Option 2: Manual Version Bump

```bash
# Edit package.json version manually
# Then commit and push to main
git add package.json
git commit -m "chore: bump version to 2.0.1"
git push origin main
```

## 🔧 Setup Requirements

### NPM Token (One-time setup)

1. Create NPM account and login:
   ```bash
   npm login
   ```

2. Generate access token:
   - Go to https://www.npmjs.com/settings/tokens
   - Click "Generate New Token"
   - Choose "Automation" type
   - Copy the token

3. Add to GitHub Secrets:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your NPM token

## 📋 What Happens During Publishing

1. **Version Check**: Compares `package.json` version with published versions
2. **Build**: Prepares package (currently no build step needed)
3. **Publish**: Uploads to NPM registry
4. **Tag**: Creates git tag (e.g., `v2.0.1`)
5. **Release**: Creates GitHub release with changelog

## 🛡️ Safety Features

- **Duplicate Prevention**: Won't publish if version already exists
- **Test Requirement**: All tests must pass before publishing
- **Security Checks**: Security audit must pass
- **Branch Protection**: Only publishes from `main` branch
- **Pre-release Detection**: Beta/alpha versions marked as pre-release

## 📊 Monitoring

- Check GitHub Actions tab for publishing status
- View releases at: https://github.com/friendofsvelte/svelicon/releases
- Monitor NPM downloads: https://www.npmjs.com/package/svelicon

## 🚨 Troubleshooting

### Publishing Failed?
1. Check GitHub Actions logs
2. Verify NPM_TOKEN secret is set
3. Ensure version in package.json is unique
4. Check NPM registry status

### Version Conflicts?
```bash
# Check current published versions
npm view svelicon versions --json

# Check what version would be published
node -p "require('./package.json').version"
```
