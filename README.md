# Zenith NEET AI — Windows Local Setup

## Ye 3 files replace karo apne project mein

```
NEET-AI-Suite/
└── artifacts/
    └── zenith-neet/
        ├── package.json          ← REPLACE karo (ye wali)
        ├── vite.config.ts        ← REPLACE karo (ye wali)
        ├── tsconfig.json         ← REPLACE karo (ye wali)
        └── src/
            ├── index.css         ← REPLACE karo (pehle wali jo diya tha)
            └── lib/
                └── api-client-shim.ts  ← NEW FILE banao (ye wali)
```

---

## Steps

### 1. Files replace karo

Upar bataye folders mein ye files copy karo.

### 2. Terminal kholo `zenith-neet` folder mein

```bash
cd NEET-AI-Suite/artifacts/zenith-neet
```

### 3. Dependencies install karo

```bash
npm install
```

*(pnpm nahi, plain npm use karo)*

### 4. Backend bhi chalao (alag terminal mein)

```bash
cd NEET-AI-Suite/artifacts/api-server
npm install
npm run dev
```

Backend `localhost:3000` pe chalega.

### 5. Frontend chalao

```bash
cd NEET-AI-Suite/artifacts/zenith-neet
npm run dev
```

Frontend `localhost:4173` pe open hoga.

---

## Agar backend nahi chalana (sirf UI dekhni hai)

`vite.config.ts` mein se `proxy` block hata do — app chalega but API calls fail hongi (data nahi dikhega).

---

## Common Errors

| Error | Fix |
|-------|-----|
| `Cannot find module @workspace/...` | `api-client-shim.ts` sahi jagah rakha hai? |
| `tailwindcss not found` | `npm install` dobara chalo |
| `Port 4173 in use` | `vite.config.ts` mein port change karo |
| API calls 502/ECONNREFUSED | Backend (`api-server`) nahi chal raha |
