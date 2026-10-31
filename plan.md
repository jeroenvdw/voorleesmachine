# Plan — Voorleesmachine

Dit document beschrijft de gemaakte keuzes, de uitgevoerde stappen (met commits) en de vervolgstappen. Werk het bij wanneer stappen voltooid worden of nieuwe besluiten vallen.

## Gemaakte keuzes

| Onderwerp | Keuze | Motivatie |
|---|---|---|
| Platform | PWA (React + Vite + TypeScript) eerst | Beste testbaarheid (Vitest + Playwright), werkt direct in de browser; Android via Capacitor als latere stap |
| OCR | Altijd AI via OpenRouter, standaardmodel `google/gemini-2.5-flash` | Zeer goede NL-kwaliteit, filtert paginanummers/bijschriften; kosten ≈ €0,05 per 100 pagina's, binnen de gratis tier praktisch €0 |
| TTS | Web Speech API (lokaal) | €0, direct, werkt offline op Android Chrome; cloud-stem als latere verbetering |
| Taal | Alleen Nederlands | Kleinste scope, Nederlandstalige boeken |
| Privacy | Foto's alleen in het geheugen, nooit bewaard | Doelgroep is kinderen (AVG-gevoelig) |

## Uitgevoerde stappen

| # | Stap | Commit | Resultaat | Verificatie |
|---|---|---|---|---|
| 1 | Scaffold | `7876141`, `f7d0ce9` | Vite + React + TS, ESLint/Prettier, Vitest, Playwright-config, CI-workflow, AGENTS.md | lint/typecheck/test groen |
| 2 | Domeinlaag | `f158631` | `appReducer` state machine (6 schermen), interfaces `ICamera`/`IOcr`/`ITts`, mocks, tekstvalidatie, foutmapping, `abortableDelay` | 33 unit tests |
| 3 | UI-schermen op mocks | `2134330` | 6 icon-only schermen, SVG-iconenset, Nederlandse labels, denk-uil-animatie, volume-stippen, `HoldToOpenButton`, `useVoorlees`-hook, galerij-input | Integratietests over de hele flow |
| 4 | Echte camera | `f7f481f` | `browserCamera.ts`: `getUserMedia` met achtercamera, wachten op eerste beeld, frame → canvas (max. 1600px JPEG), review-stap | Unit tests + flow-tests |
| 5 | OCR via OpenRouter + ouders-menu | `7fae650` | `openrouterOcr.ts` met cleanup-prompt, timeout, foutcodes (`no-api-key`/`no-internet`/`timeout`/`failed`); settings in localStorage (`voorleesmachine:settings`); ouders-scherm met sleutel + model | 16 extra tests (service, settings, scherm) |
| 6 | TTS via Web Speech API | `93f69fa` | `webSpeechTts.ts`: nl-NL-stemkeuze, chunking per alinea/zin (max. ~200 tekens), pauze/hervatten, volume-herstart huidig stuk, generation-guard tegen late events | 9 tests met nep-synthesizer |
| 7 | Foutafhandeling + herkansing | `93fed58` | Automatische tweede poging bij leeg OCR-resultaat; foutpictogrammen per foutcode met herstelknop | Extra flow-test (retry wordt aangeroepen) |
| 8 | PWA | `9f7e7eb` | Manifest, 4 PWA-iconen via `scripts/make-icons.ps1` (GDI+), handgeschreven `sw.js` met offline-shell, registratie in `main.tsx`, meta-tags | Build bevat alle assets |
| 9 | E2E + CI | `726d0e8` | 3 Playwright-tests op `?mock=1` (happy flow, geen-tekst-foutpad, PWA-checks); Vitest sluit `e2e/` uit | E2E groen in Chromium |
| 10 | Documentatie | `0571171` | AGENTS.md uitgebreid (commands, services, tandwiel) | — |
| 11 | Dev server op LAN | `0b48bb0`+ | `server.host: true` en `preview.host: true`; app bereikbaar op `http://<LAN-IP>:5173` (bijv. vanaf een gsm) | HTTP 200 op localhost én LAN-IP |
| 12 | HTTPS voor dev over LAN | — | `npm run dev:https` met `@vitejs/plugin-basic-ssl` (expliciet goedgekeurd): echte camera werkt op `https://<LAN-IP>:5173` na accepteren van het certificaat; e2e draait nog steeds http | HTTPS 200 op localhost én LAN-IP, http geweigerd; lint/typecheck/test/e2e groen |

### Actuele status

- Happy path werkt volledig op mocks (`?mock=1`) én met echte camera + OpenRouter + Web Speech; eerste gesproken woord binnen ~8 s na de foto.
- 66 unit tests en 3 e2e-tests slagen; `lint`, `typecheck` en `build` zijn foutloos.
- CI (GitHub Actions) draait lint, typecheck, unit tests en e2e op elke push.
- Ontbrekend voor productiegebruik: een geldige OpenRouter API-key in het ouders-menu; zonder key toont de app de sleutel-foutstate.

## Vervolgstappen

Volgorde op volgorde van nut; elke stap = eigen commit met groene tests.

### Fase A — direct bruikbaar maken (P1)

1. **E2E met echte foto-fixtures**: gebruik echte foto's van kinderboekpagina's als testfixtures (bijv. `e2e/fixtures/`) en test de OpenRouter-integratie tegen een opgenomen API-respons (gestubde `fetch`), zodat prompt-wijzigingen regressietesten krijgen.
   - DoD: fixture-driven test groen; OCR-prompt versiebeheer.
2. **Hosting + installatie-ervaring**: deploy `dist/` naar gratis hosting (GitHub Pages/Netlify), test "installeren" op Android Chrome, check manifest/iconen via Lighthouse.
   - DoD: publieke URL waarop de app geïnstalleerd kan worden; Lighthouse PWA-audit groen.
3. **Veldtest met een kind en een echt boek**: controleer foto-hoek, belichting, volumegedrag en of de denk-animatie lang genoeg/kort genoeg voelt; noteer verbeterpunten.
   - DoD: lijstje bevindingen → mini-stapjes in deze lijst.

### Fase B — lees-ervaring (P2)

4. **Boekmodus (FR14)**: na afloop van een pagina direct terug naar de camera (al openstaan), zodat een boek pagina voor pagina voorgelezen wordt zonder menu's.
   - DoD: flow-test in e2e; toggle in ouders-menu.
5. **Laatste positie onthouden (FR15)**: laatst gelezen pagina/tekst lokaal bewaren en aanbieden bij de start.
   - DoD: unit tests + e2e.
6. **Voorleessnelheid instelbaar** in het ouders-menu (rate van de TTS, standaard 0.95).
   - DoD: instelling zichtbaar in `ITts.speak` en getest.
7. **Cloud-stem als optie (P2)**: Google Cloud TTS Neural2 (gratis laag ≈ 1 M tekens/maand) als alternatieve TTS-provider naast Web Speech, in te stellen in het ouders-menu.
   - DoD: `ITts`-implementatie + providerkeuze + tests; UI blijft icon-only.

### Fase C — robuustheid (P2)

8. **Tesseract.js als offline-OCR-fallback**: bij `no-internet` of ontbrekende sleutel lokaal OCR met Nederlandse `nld`-traineddata (lazy-load).
   - DoD: fallback getest; app leest ook zonder internet; trager resultaat duidelijk gemarkeerd in tests.
9. **Cloudflare Worker-proxy voor de API-key** (gratis tier): server-side key, browser stuurt geen geheim meer mee; ouders-menu krijgt proxy-URL-instelling.
   - DoD: OCR werkt via proxy; huidige key-pad blijft als alternatief werken.
10. **Capacitor Android-build**: `@capacitor/core`/`cli`/`android` (expliciete goedkeuring nodig volgens AGENTS.md), APK-build, native camera/TTS-check; eventueel ML Kit-OCR-plugin als snelle on-device optie.
    - DoD: installeerbare APK; web-versie blijft ongewijzigd werken.

### Fase D — fijne kantjes (P3)

11. Betere foutdiagnose bij wazige foto's (scherpte-metric lokaal) met gerichte hint.
12. Meerdere pagina's achter elkaar laten inspreken (wachtrij) vóór het maken van de volgende foto.
13. Meertaligheid (NL+EN) als ouders-instelling, met taalstem per OCR-resultaat.
14. Periodieke `npm audit`-taak in CI en Dependabot/renovate-configuratie.

## Niet gepland (bewust)

- Geen accounts, geen analytics/tracking op kindschermen, geen tekstlabels in kind-schermen, geen extra dependencies zonder expliciete opdracht.
