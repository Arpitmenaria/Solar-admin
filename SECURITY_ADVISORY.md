# 🚨 Security Advisory: Malicious Code Detection in Build Configuration Files

## Issue Discovered
A critical **supply chain attack** was detected in the `postcss.config.mjs` file containing obfuscated malicious JavaScript code designed to:
- Execute arbitrary Node.js code during build time
- Make unauthorized network requests to blockchain RPC endpoints
- Potentially exfiltrate data or perform cryptocurrency-related operations
- Compromise the build environment

## Affected File
- `postcss.config.mjs` (and potentially other config files)

## How to Check Your Projects

### 1. **Inspect Build Configuration Files**
Check these files for suspicious code:
```
postcss.config.mjs
postcss.config.js
webpack.config.js
next.config.js
tsconfig.json (and other JSON configs)
package.json (check scripts section)
.env and .env.* files
```

### 2. **Red Flags to Look For**
Malicious config files typically contain:
- ✗ Obfuscated/minified code in config files (should be human-readable)
- ✗ Long strings of hex values or base64 encoded data
- ✗ `eval()`, `spawn()`, `require()` with dynamic paths
- ✗ Code attempting to read/write environment variables
- ✗ Network requests to unknown URLs (crypto, RPC endpoints, etc.)
- ✗ Comments or code after the normal config export
- ✗ Unusual imports from suspicious packages

### 3. **Quick Audit Command**
```bash
# Check for obfuscated code patterns
grep -r "eval\|spawn\|Buffer\|0x[0-9a-f]\{4,\}" --include="*.js" --include="*.mjs" --include="*.config.js" .

# Look for unusual hex strings in config files
grep -E "[0-9a-f]{100,}" postcss.config.mjs next.config.js webpack.config.js

# Check file sizes - config files should be small
ls -lh postcss.config.mjs next.config.js webpack.config.js
```

### 4. **Proper Config File Examples**

**✅ CLEAN postcss.config.mjs:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**✅ CLEAN next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

### 5. **Remediation Steps**

**If you find malicious code:**

1. **Immediately Stop Development**
   ```bash
   npm run dev  # Stop the dev server
   ```

2. **Backup Original Files**
   ```bash
   cp postcss.config.mjs postcss.config.mjs.backup
   git status  # Check what changed
   ```

3. **Restore Clean Versions**
   - From version control: `git checkout -- postcss.config.mjs`
   - Or rewrite from scratch with known-good template

4. **Check Dependencies**
   ```bash
   npm audit
   npm audit fix
   npm ls  # Check for suspicious packages
   ```

5. **Scan node_modules**
   ```bash
   # Look for suspicious patterns in dependencies
   find node_modules -name "*.js" -type f -exec grep -l "eval\|spawn\|RPC\|0x[0-9a-f]" {} \;
   ```

6. **Clear Cache & Reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

7. **Commit the Fix**
   ```bash
   git add postcss.config.mjs package.json
   git commit -m "security: remove malicious code from postcss.config.mjs"
   git push
   ```

### 6. **Prevention Going Forward**

✅ **Best Practices:**
- Keep config files **human-readable and concise**
- Use `.gitignore` to track what should/shouldn't be committed
- Enable **Git pre-commit hooks** to validate config files
- Use **code review process** before merging config changes
- Regularly audit `node_modules` with `npm audit`
- Pin exact versions in `package-lock.json`
- Use security scanning tools:
  ```bash
  npm install --save-dev snyk
  npx snyk test
  ```

### 7. **Security Scanning Tools**

Install and use security scanners:
```bash
# Snyk - vulnerability scanning
npm install -g snyk
snyk test

# npm audit - built-in
npm audit
npm audit fix

# OWASP Dependency Check
npm install --save-dev @owasp/dependency-check
```

### 8. **Team Communication**

If you discover this in your project:
1. **Alert your team immediately**
2. **Notify security team/leadership**
3. **Audit git history** for when it was introduced
4. **Check who had access** to the repository
5. **Review recent deployments** - the code may have been running in production
6. **Rotate credentials** if the malicious code ran on CI/CD systems

### 9. **Additional Resources**

- [NPM Security Best Practices](https://docs.npmjs.com/cli/v8/using-npm/config#registry)
- [OWASP Supply Chain Security](https://owasp.org/www-community/attacks/Supply_chain_attack)
- [NPM Audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

## Timeline of This Incident
- **Detected**: PostCSS config file containing obfuscated malicious code
- **Action Taken**: Removed all malicious code, restored clean config
- **Status**: Fixed ✅

**If you have similar issues, apply these steps immediately.**

---

*This advisory should be shared with all team members and projects using this tech stack.*
