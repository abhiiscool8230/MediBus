# MediBus Deployment & Build Guide

This document outlines the standard procedures for testing, committing, and deploying the MediBus application to production using Next.js, GitHub, and Vercel.

---

## 1. Local Build Testing
Before pushing any code to production, it is best practice to test the strict production build locally. This ensures no hidden TypeScript or ESLint errors will break the Vercel deployment.

**Run the build compiler:**
\`\`\`bash
npm run build
\`\`\`
*Note: This command compiles the code into an optimized `.next` folder but does not start a server.*

**Test the compiled production build:**
\`\`\`bash
npm start
\`\`\`
*Open `http://localhost:3000` to verify the production-ready site.*

---

## 2. Standard Deployment (via GitHub)
Vercel is linked to the GitHub repository. Pushing to the `main` branch will automatically trigger a new production build.

**Execute the following commands to deploy:**
\`\`\`bash
git add .
git commit -m "chore: describe your updates here"
git push origin main
\`\`\`
*Once pushed, monitor the deployment progress in your Vercel Dashboard.*

---

## 3. Manual / Forced Deployment (via Vercel CLI)
If the GitHub webhook fails or you need to bypass GitHub and push directly from your local terminal to Vercel, use the Vercel CLI.

**Step A: Authenticate (if token is invalid/expired)**
\`\`\`bash
npx vercel login
\`\`\`
*Select "Continue with GitHub" and authorize in your browser.*

**Step B: Deploy to Production**
\`\`\`bash
npx vercel --prod
\`\`\`

**CLI Prompts & Answers:**
*   **Set up and deploy?** `Y`
*   **Which scope?** `[Press Enter]`
*   **Link to existing project?** `Y`
*   **What's the name of your existing project?** `medi-bus`
*   **In which directory is your code?** `[Press Enter]`

*The CLI will upload your files and output a live `.vercel.app` URL upon completion.*