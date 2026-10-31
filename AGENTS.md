# AGENTS.md — Voorleesmachine

Lees dit bestand vóór elke taak en volg de afspraken exact op.

## Project (samenvatting)

"Voorleesmachine" is een PWA voor kinderen die met één grote knop een foto maakt van een boekpagina, de tekst met AI herkent (OCR via OpenRouter) en die daarna in het Nederlands voorleest (TTS via de Web Speech API). De UI is volledig icon-only: grote ronde knoppen, geen zichtbare tekst, een "denk"-uil-animatie tijdens het verwerken en icon-only foutmeldingen met herstelknoppen. Kinderen zijn de gebruiker — eenvoud, directe feedback en privacy (foto's worden alleen in het geheugen verwerkt en nooit bewaard) staan voorop. Instellingen voor volwassenen zitten verborgen achter het tandwiel-icoon. De app draait in de browser en is als PWA installeerbaar op Android; een native Android-build (Capacitor) is een toekomstige, optionele stap.

## Commands

| Commando | Wat het doet |
|---|---|
| `npm run dev` | Vite dev server (standaard poort 5173, http) |
| `npm run dev:https` | Vite dev server met zelfgesigned certificaat (`@vitejs/plugin-basic-ssl`) — nodig voor de echte camera via LAN-IP of gsm |
| `npm run build` | Typecheck (`tsc -b`) + productiebuild naar `dist/` |
| `npm run lint` | ESLint over `src/`, `e2e/` en configs (moet foutloos slagen) |
| `npm run typecheck` | `tsc -b` over alle projecten (moet foutloos slagen) |
| `npm test` | Vitest unit tests, éénmalig draaien (moeten slagen) |
| `npm run test:watch` | Vitest in watch-modus |
| `npm run e2e` | Playwright end-to-end tests (start zelf de dev server op poort 5173) |

Eénmalige setup vóór `npm run e2e`: `npx playwright install chromium` (downloadt de Chromium-testbrowser).

Iconen opnieuw genereren (PWA-iconen in `public/icons/`): `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\make-icons.ps1`

**npm vs. npm.cmd:** in PowerShell op deze machine blokkeert de execution policy `npm.ps1`; gebruik daar altijd `npm.cmd` (dus `npm.cmd run lint`, `npm.cmd test`, …). In andere shells (bash, cmd.exe) en in CI (GitHub Actions draait op Linux) werkt `npm` gewoon. Hetzelfde geldt voor `npx.cmd` i.p.v. `npx` in PowerShell. Vóór elke commit moeten slagen: `npm run lint`, `npm run typecheck` en `npm test`.

**Netwerktoegang:** de dev server (en `vite preview`) luistert op alle interfaces (`server.host: true` in `vite.config.ts`), dus de app is in het lokale netwerk bereikbaar op `http://<LAN-IP>:5173/`, bijvoorbeeld vanaf een gsm. Sta Node.js eventueel toe in Windows Firewall voor privénetwerken. Let op: de camera (`getUserMedia`) en de service worker vereisen een *secure context* — `localhost` telt mee, een http-LAN-IP niet. Via `http://<LAN-IP>` werkt daarom alleen de mock-modus volledig. Voor de echte camera over het netwerk: start `npm run dev:https` en open `https://<LAN-IP>:5173/` (self-signed certificaat; accepteer de browserwaarschuwing, daarna werkt de camera). Alternatieven: `adb reverse tcp:5173 tcp:5173` of echte hosting.

## Services (achterliggende implementaties)

Alle services zitten achter interfaces in `src/services/`; de UI kent alleen de interfaces. Elke service heeft een mock in `src/services/mock/`.

| Service | Interface | Productie-implementatie | Mock |
|---|---|---|---|
| Camera | `ICamera` (`src/services/camera/`) | `browserCamera.ts` — `getUserMedia` met achtercamera (`facingMode: environment`), frame naar canvas (max. 1600px, JPEG) | `mockCamera.ts` — tekent een nep-boekpagina op canvas |
| OCR | `IOcr` (`src/services/ocr/`) | `openrouterOcr.ts` — POST naar `https://openrouter.ai/api/v1/chat/completions`, afbeelding als data-URL, cleanup-prompt (filtert paginanummers/bijschriften), standaardmodel `google/gemini-2.5-flash` (instelbaar), timeout 60 s; foutcodes: `no-api-key`, `no-internet`, `timeout`, `failed` | `mockOcr.ts` — geeft na korte vertraging een standaardverhaal; varianten via URL |
| TTS | `ITts` (`src/services/tts/`) | `webSpeechTts.ts` — Web Speech API (`speechSynthesis`), stemkeuze nl-NL, tekst in stukken per alinea/zinnen (max. ~200 tekens), volume-aanpassing herstart het huidige stuk | `mockTts.ts` — simuleert spreken met timers |

De orchestratie (foto → OCR → voorlezen) staat in de state machine (`src/domain/state.ts`) en de hook `src/components/useVoorlees.ts`. Bij een leeg OCR-resultaat wordt automatisch één keer opnieuw geprobeerd.

**Mock-modus:** met query-param `?mock=1` draait de app volledig op mocks (geen camera/mic/netwerk nodig). Extra varianten voor e2e-tests: `?mock=1&ocr=empty` (OCR geeft geen tekst terug) en `?mock=1&ocr=fail` (OCR faalt). Elke nieuwe service móét in mock-modus werken; e2e-tests draaien altijd met `?mock=1`.

## Het tandwiel-icoon (ouders-menu)

Het tandwiel staat linksboven op het startscherm en is bewust semi-transparant: kinderen kunnen er zo weinig mee. **2 seconden ingedrukt houden** opent het verborgen ouders-menu (`src/parents/ParentsScreen.tsx`, detectie via `HoldToOpenButton.tsx`). Daarin staat:

- **Geheime sleutel (OpenRouter)** — de API-key die de OCR-service nodig heeft; opgeslagen in localStorage onder sleutel `voorleesmachine:settings` en uitsluitend naar OpenRouter verstuurd bij het herkennen van een pagina.
- **AI-model** — het OpenRouter-model (standaard `google/gemini-2.5-flash`).
- **Opslaan-knop** — slaat beide waarden op; het status-icoon erboven (sleutel/vinkje) toont of er al een sleutel staat.
- **Terug-knop** — keert terug naar de app zonder iets te wijzigen.

Kinderen hebben deze schermen normaal nooit te zien; zichtbare tekst is hier toegestaan (uitsluitend in het ouders-menu).

## Regels

- TypeScript strict; geen `any`; imports van types met `import type` (verbatimModuleSyntax staat aan).
- GEEN code-comments, tenzij expliciet gevraagd.
- Services (camera / OCR / TTS) zijn altijd achter interfaces in `src/services/`; de UI kent alleen de interfaces. Unit- en e2e-tests gebruiken de mocks uit `src/services/mock/`.
- UI is volledig icon-only: geen zichtbare tekstlabels in kind-schermen. Elk interactief element krijgt een Nederlandse `aria-label` (toegankelijkheid + testbaarheid). Aanraakvlakken minimaal 64×64 px, voorkeur veel groter.
- Voordat je commit: `npm run lint`, `npm run typecheck` en `npm test` slagen. Eén commit per afgeronde stap, in het Engels, conventionele stijl (`feat:`, `chore:`, `test:` …).
- Geheimen (OpenRouter API-key) nooit in code of commits; de key staat uitsluitend in localStorage via het ouders-menu.
- Geen nieuwe dependencies zonder expliciete opdracht; houd de bundle klein.
- Foutafhandeling is icon-only: elke fouttoestand heeft een eigen pictogram + grote herstelknop.

## Structuur

- `src/domain/` — types, state machine en pure logica (uitgebreid unit-getest)
- `src/services/` — interfaces en implementaties: `camera/`, `ocr/`, `tts/` + `mock/`
- `src/lib/` — kleine generieke helpers (delay/canvas/blob)
- `src/components/` — schermen en herbruikbare bouwstenen
- `src/parents/` — verborgen ouders-instellingen (API-key, model)
- `e2e/` — Playwright e2e-tests (draaien met `?mock=1`)
- `src/test/` — test-setup en helpers
- `scripts/` — hulpscripts (o.a. iconengeneratie voor de PWA)
- `public/` — manifest, service worker en PWA-iconen
- `.github/workflows/ci.yml` — CI: lint, typecheck, unit tests en e2e op elke push

## Proces

Werk stapsgewijs; één stap voltooien = tests groen = commit. Houd dit bestand up-to-date wanneer structuur of regels veranderen.
