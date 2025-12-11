# Node.js Version Management

This document explains how Node.js versions are managed across development, testing, and production environments.

## Version Specification

**Current Node.js Version**: `20.19.4` (LTS)

This version is specified in multiple places to ensure consistency:

### 1. `.nvmrc` file
```
20.19.4
```
- Used by Node Version Manager (nvm) to automatically switch to the correct Node.js version
- When you run `nvm use`, it will read this file and switch to Node.js 20.19.4

### 2. `package.json` engines field
```json
{
  "engines": {
    "node": "20.19.4",
    "npm": ">=9.0.0"
  }
}
```
- Enforces the Node.js version requirement
- Prevents installation on unsupported Node.js versions

### 3. Docker Images
```dockerfile
FROM node:20.19.4-alpine
```
- Both `Dockerfile.frontend` and `Dockerfile.admin` use Node.js 20.19.4
- Ensures production runs the same Node.js version as development

## Automatic Version Switching

### Using nvm (Recommended)
```bash
# Install and use the specified Node.js version
nvm install
nvm use

# Or combine into one command
nvm install && nvm use
```

### Using nvmrc (Automatic)
If you have the following in your shell configuration (`.bashrc`, `.zshrc`, etc.):
```bash
# Automatically load .nvmrc when entering directory
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  elif [ "$node_version" != "$(nvm version default)" ]; then
    echo "Reverting to nvm default version"
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

## Docker Deployment

### Development Docker
```bash
# Uses MongoDB only (development)
docker compose up -d
```

### Production Docker
```bash
# Build and deploy with specific Node.js version
npm run docker:prod

# Or step by step
npm run docker:build
npm run docker:up
```

The production Docker configuration:
- Uses Node.js 20.19.4 Alpine Linux image
- Runs both frontend (port 3000) and admin (port 3001) applications
- Includes MongoDB database
- All services use the same Node.js version

## Version Requirements

### Why Node.js 20.19.4?
1. **Next.js Compatibility**: Next.js 16 requires Node.js >= 20.9.0
2. **LTS Support**: Node.js 20 is an LTS (Long Term Support) version
3. **Stability**: LTS versions receive security updates and bug fixes for extended periods
4. **Docker Availability**: Official Docker images are readily available

### Compatibility Check
```bash
# Check current Node.js version
node --version

# Check if version matches .nvmrc
cat .nvmrc

# Verify Next.js compatibility
npm view next@latest engines
```

## Testing with Correct Node Version

Before running tests or deploying, ensure you're using the correct Node.js version:

```bash
# Verify Node version
node --version  # Should output: v20.19.4

# If not correct, switch to the project version
nvm use

# Now run tests with confidence
npm test
```

## Troubleshooting

### Version Mismatch Error
```
Error: The module was compiled against a different Node.js version
```
**Solution**: Ensure you're using the correct Node.js version:
```bash
nvm use
npm install  # Reinstall dependencies with correct Node version
```

### Docker Build Fails
If Docker build fails with Node.js version issues:
1. Verify the Dockerfile uses `node:20.19.4-alpine`
2. Check that `.dockerignore` doesn't exclude necessary files
3. Ensure the Node.js version in `.nvmrc` matches Dockerfile

### npm Engine Warnings
```
npm WARN EBADENGINE Unsupported engine
```
**Solution**: Update Node.js to match the required version or adjust the engines field in package.json

## Best Practices

1. **Always use nvm**: Automatically manage Node.js versions per project
2. **Commit .nvmrc**: Include `.nvmrc` in version control
3. **Pin Docker version**: Use specific Node.js versions in Dockerfiles (not `latest`)
4. **Test before deploy**: Verify Node.js version matches before testing or deployment
5. **Update together**: When updating Node.js, update all references simultaneously

## Version Update Process

If you need to update Node.js version:

1. Update `.nvmrc`
2. Update `package.json` engines field
3. Update Dockerfiles
4. Reinstall dependencies: `rm -rf node_modules && npm install`
5. Test everything works
6. Update this documentation