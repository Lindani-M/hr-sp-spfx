# TalentGPT — SPFx Web Part

Renders TalentGPT natively inside any SharePoint Online page, with no iframe.
The backend (`app.py`) is **unchanged** — the web part simply calls your Azure App Service API.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | **18 LTS** (required) | `nvm install 18 && nvm use 18` |
| gulp-cli | latest | `npm install -g gulp-cli` |
| (optional) yo + generator | for future scaffolding | `npm install -g yo @microsoft/generator-sharepoint` |

> **Important — you have Node 24 installed.** SPFx 1.18 only supports Node 16/18.  
> Run `nvm use 18` (or install nvm first: https://github.com/nvm-sh/nvm) before every session.

---

## 1 — Install dependencies

```bash
cd spfx
nvm use 18          # switch to Node 18 first!
npm install
```

---

## 2 — Test locally (SharePoint Workbench)

The SPFx local server runs at `https://localhost:4321` and connects to the **real** SharePoint Online Workbench.

```bash
cd spfx
nvm use 18
gulp serve
```

This will:
1. Start an HTTPS dev server at `https://localhost:4321`
2. Open the SharePoint Online Workbench at:  
   `https://roleio.sharepoint.com/sites/GroupHR/_layouts/workbench.aspx`

In the Workbench:
- Click the **+** button → search **TalentGPT** → add the web part
- Click the **edit pencil** on the web part → enter your API URL:  
  `https://sp-ai-chat-f3drg5cjaqauhvbm.canadacentral-01.azurewebsites.net`
- The chat will be live

> **First time only:** Your browser will warn about the untrusted localhost certificate.  
> Visit `https://localhost:4321` directly, click "Advanced → Proceed" to trust it.

---

## 3 — Build the production package

```bash
cd spfx
nvm use 18
gulp bundle --ship          # production webpack bundle
gulp package-solution --ship  # creates talent-gpt.sppkg
```

The package is output to:
```
spfx/solution/talent-gpt.sppkg
```

---

## 4 — Deploy to SharePoint (App Catalog) — Step by step

### 4a — Open the App Catalog

1. Go to: `https://roleio.sharepoint.com/sites/appcatalog` (or search for "App Catalog" in the SharePoint Admin Center)
2. If you don't have an App Catalog yet → SharePoint Admin Center → **Apps** → **App Catalog** → Create it

### 4b — Upload the package

1. Click **Apps for SharePoint** in the left menu
2. Click **Upload** → select `spfx/solution/talent-gpt.sppkg`
3. A dialog appears: **"Do you trust talent-gpt-client-side-solution?"**
4. Click **Deploy** (choose "Make this solution available to all sites in the organization" if you want it everywhere)

### 4c — Add the web part to a page

1. Navigate to your **MSc Documents SharePoint site**: `https://roleio.sharepoint.com/sites/GroupHR`
2. Open a page (or create a new one) → click **Edit**
3. Click the **+** button in a section → search **TalentGPT** → click it
4. The web part appears — click the **edit pencil** → enter the API URL:  
   `https://sp-ai-chat-f3drg5cjaqauhvbm.canadacentral-01.azurewebsites.net`
5. Click **Publish** (or **Republish** if the page already existed)

### 4d — For a full-page feel

1. In the page editor, click the **section** → **Edit section** → set column to **Full width**
2. In the web part property pane → set **Height** to `800` or higher
3. Publish the page

---

## 5 — Backend changes required (Azure App Service)

### 5a — Update CORS in your App Service

In the Azure Portal → your App Service (`talentgpt-api` or similar):
1. Go to **Settings → CORS**
2. Add `https://roleio.sharepoint.com` to the allowed origins
3. Save

**OR** (if you manage CORS in app.py directly), update the `ALLOWED_ORIGINS` environment variable:
```
ALLOWED_ORIGINS=https://roleio.sharepoint.com,https://localhost:4321
```
This is already set in your `.env` file. For the existing Azure App Service (`sp-ai-chat`), set this in:
**Configuration → Application settings → `ALLOWED_ORIGINS`**.

### 5b — No other backend changes needed

`app.py` handles `/chat`, `/search`, and `/health` — all unchanged. The SPFx web part calls the same endpoints.

---

## 6 — Project structure

```
spfx/
├── config/
│   ├── config.json               ← bundle entry points
│   ├── package-solution.json     ← .sppkg metadata & solution GUID
│   └── serve.json                ← local dev server (points to SP Workbench)
├── src/webparts/talentGpt/
│   ├── TalentGptWebPart.ts       ← SPFx entry — property pane (API URL, height)
│   ├── TalentGptWebPart.manifest.json
│   ├── _variables.scss           ← brand palette SCSS variables
│   ├── assets/image.png          ← Allan Gray logo
│   ├── api/chat.ts               ← fetch wrapper → /chat endpoint
│   ├── types/chat.ts             ← TypeScript interfaces
│   └── components/
│       ├── TalentGpt.tsx         ← root React component
│       ├── ChatMessage.tsx
│       ├── ChatInput.tsx
│       ├── Sidebar.tsx
│       └── SourceCard.tsx
├── gulpfile.js
├── package.json                  ← SPFx 1.18.2 deps (React 17, Node 18)
└── tsconfig.json
```

---

## 7 — Upgrading the package later

After any code change:
```bash
gulp bundle --ship
gulp package-solution --ship
```
Then in the App Catalog → click the existing `talent-gpt.sppkg` → **Upload** the new file → it auto-upgrades on all pages that use it (no need to re-add the web part).
