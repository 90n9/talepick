# Git Ignore Guide for TalePick

This guide explains what files should be tracked in Git and what should be ignored.

## Files That SHOULD Be Committed

### Configuration Files
- ✅ `.nvmrc` - Node.js version specification
- ✅ `.prettierrc.json` - Prettier configuration
- ✅ `.prettierignore` - Prettier ignore patterns
- ✅ `.editorconfig` - Editor configuration
- ✅ `eslint.config.mjs` - ESLint configuration
- ✅ `apps/*/eslint.config.mjs` - App-specific ESLint configs
- ✅ `.vscode/settings.json` - VSCode settings (optional)
- ✅ `.vscode/extensions.json` - VSCode recommended extensions

### Project Structure
- ✅ `package.json` - Dependencies and scripts
- ✅ `package-lock.json` - Locked dependency versions
- ✅ `apps/*/package.json` - App-specific dependencies
- ✅ `packages/*/package.json` - Package-specific dependencies

### Docker Files
- ✅ `Dockerfile.frontend` - Frontend Docker configuration
- ✅ `Dockerfile.admin` - Admin Docker configuration
- ✅ `docker-compose.yml` - Development Docker setup
- ✅ `docker-compose.prod.yml` - Production Docker setup
- ✅ `.dockerignore` - Docker ignore patterns

### Development Tools
- ✅ `.husky/pre-commit` - Git pre-commit hook
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `apps/*/tsconfig.json` - App-specific TypeScript configs
- ✅ `next.config.ts` - Next.js configuration
- ✅ `apps/*/next.config.ts` - App-specific Next.js configs

### Documentation
- ✅ `docs/` - Project documentation
- ✅ `README.md` - Project README
- ✅ `FOLDER_STRUCTURE.md` - Project structure documentation
- ✅ `PROJECT_ROADMAP.md` - Project roadmap

## Files That SHOULD NOT Be Committed

### Environment Variables
- ❌ `.env` - Environment variables
- ❌ `.env.local` - Local environment overrides
- ❌ `.env.development.local` - Development local overrides
- ❌ `.env.test.local` - Test local overrides
- ❌ `.env.production.local` - Production local overrides

### Build Outputs
- ❌ `.next/` - Next.js build output
- ❌ `out/` - Static export output
- ❌ `build/` - Build artifacts
- ❌ `dist/` - Distribution files

### Dependencies
- ❌ `node_modules/` - Installed dependencies
- ❌ `.npm` - npm cache
- ❌ `.cache/` - Build cache

### Logs and Temporary Files
- ❌ `*.log` - Log files
- ❌ `npm-debug.log*` - npm debug logs
- ❌ `.DS_Store` - macOS system files
- ❌ `Thumbs.db` - Windows thumbnail cache
- ❌ `*.tmp` - Temporary files
- ❌ `*.swp`, `*.swo` - Vim swap files

### IDE Files
- ❌ `.vscode/` - VSCode workspace settings (except shared settings)
- ❌ `.idea/` - JetBrains IDE settings
- ❌ `*.code-workspace` - VSCode workspace files

### Test Coverage
- ❌ `coverage/` - Test coverage reports
- ❌ `*.lcov` - LCOV coverage files

### Database
- ❌ `data/` - Local database files
- ❌ `mongo_data/` - MongoDB data directory
- ❌ `*.sqlite`, `*.db` - Local database files

### Security and Secrets
- ❌ `*.pem` - SSL certificates
- ❌ `*.key` - Private keys
- ❌ `id_rsa*` - SSH keys
- ❌ `.aws/` - AWS credentials
- ❌ `.firebase/` - Firebase credentials

## Best Practices

### 1. Use Environment-Specific Configs
```bash
# Good: Use different .env files for each environment
.env.development
.env.test
.env.production

# Bad: Commit actual values
.env.local  # Should be ignored
```

### 2. Include Example Configs
```bash
# Good: Provide template
.env.example
config.example.json

# These should be committed and used as templates
```

### 3. Don't Ignore Important Configs
```bash
# These should be tracked:
.nvmrc          # Node.js version
package-lock.json  # Exact dependency versions
Dockerfile      # Build configuration
```

### 4. Use .gitignore Effectively
- Keep `.gitignore` up to date
- Add patterns early before files are created
- Use specific patterns rather than generic ones
- Document why certain files are ignored

### 5. Review Before Committing
```bash
# Check what you're about to commit
git status
git diff --cached

# Use .git/info/exclude for personal ignores (not shared)
```

## Common Patterns

### Node.js Projects
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
.next/
out/
build/
dist/

# Environment
.env*
!.env.example
```

### Development Environment
```gitignore
# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

### Testing
```gitignore
# Coverage
coverage/
*.lcov

# Test results
test-results/
```

## Troubleshooting

### Already Committed Files That Should Be Ignored
If you accidentally committed files that should be ignored:

```bash
# Remove from tracking but keep locally
git rm --cached filename
git rm --cached -r directory/

# Update .gitignore
echo "filename" >> .gitignore
git add .gitignore
git commit -m "Add to gitignore and remove sensitive files"
```

### Files Not Being Ignored
If files aren't being ignored:

1. Check if they're already tracked:
   ```bash
   git ls-files | grep filename
   ```

2. Remove from tracking first:
   ```bash
   git rm --cached filename
   ```

3. Check .gitignore syntax:
   ```bash
   git check-ignore filename
   ```

### Ignoring Already Tracked Files
```bash
# Stop tracking but keep file
git update-index --assume-unchanged filename

# Resume tracking if needed
git update-index --no-assume-unchanged filename
```