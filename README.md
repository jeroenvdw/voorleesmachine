# Voorleesmachine

Een spraakmakende voorlees-app voor kinderen: maak met één grote knop een foto van een boekpagina, en de app leest de tekst voor in het Nederlands.

**Live: [jeroenvdw.github.io/voorleesmachine](https://jeroenvdw.github.io/voorleesmachine/)**

[![CI](https://github.com/jeroenvdw/voorleesmachine/actions/workflows/ci.yml/badge.svg)](https://github.com/jeroenvdw/voorleesmachine/actions/workflows/ci.yml)
[![Deploy](https://github.com/jeroenvdw/voorleesmachine/actions/workflows/deploy.yml/badge.svg)](https://github.com/jeroenvdw/voorleesmachine/actions/workflows/deploy.yml)

![Startscherm van de Voorleesmachine](docs/screenshot-home.png)

## Waarom zo gebouwd

Kinderen zijn de gebruiker. Daarom is de hele UI **icon-only**: geen enkele zichtbare tekst in de kindschermen, alleen grote ronde knoppen (minimaal 64×64 px, in de praktijk veel groter), directe feedback en een "denkende uil" tijdens het verwerken. Elk icoon heeft wél een Nederlandse `aria-label`, voor toegankelijkheid én testbaarheid.

## Wat de app doet

1. **Foto maken** van een boekpagina (achtercamera) of kiezen uit de galerij
2. **Review**: deze pagina houden of opnieuw fotograferen
3. **Denken**: de uil denkt na terwijl de tekst herkend wordt (OCR)
4. **Voorlezen**: met pauze/hervatten, nog-een-keer-luisteren en grote volumeknoppen
5. **Volgende pagina**: één knop om het boek verder te lezen

Bij fouten (geen tekst gevonden, geen internet, camera werkt niet, …) toont de app een icon-only foutmelding met grote herstelknoppen — inclusief een knop om direct de volgende pagina te scannen. Tijdens gebruik blijft het scherm actief (Screen Wake Lock).

### Voor volwassenen: het tandwiel

Linksboven op het startscherm staat een semi-transparant tandwiel. **Twee seconden ingedrukt houden** opent het verborgen instellingenmenu met daarin de OpenRouter API-sleutel en het AI-model. De sleutel staat uitsluitend in de localStorage van het toestel en wordt alleen naar OpenRouter gestuurd bij het herkennen van een pagina.

## Onder de motorkap

| Onderdeel | Technologie |
|---|---|
| Camera | Web `getUserMedia`, achtercamera, frame via canvas (max. 1600 px JPEG) |
| Tekstherkenning | [OpenRouter](https://openrouter.ai) (standaard `google/gemini-2.5-flash`) met "verzin niets"-regel en `GEEN_TEKST`-sentinel tegen hallucinaties |
| Voorlezen | Web Speech API (`speechSynthesis`), Nederlandse stem, tekst in stukken per alinea/zin |
| PWA | Manifest, service worker met offline-shell, installeerbaar op Android |
| Framework | React 19 + TypeScript (strict) + Vite |

Alle services zitten achter interfaces (`src/services/`) met mocks (`src/services/mock/`): de volledige app is testbaar zonder camera, microfoon of internet. De pipeline (foto → OCR → voorlezen) staat in een pure state machine (`src/domain/state.ts`), unit-getest.

## Snel starten

Vereist: Node.js ≥ 20.19.

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`. Voor de echte camera vanaf een ander toestel in het netwerk:

```bash
npm run dev:https
```

Open `https://<LAN-IP>:5173/` en accepteer het zelfgesigned certificaat (camera en service worker eisen https).

**PowerShell-gebruikers:** gebruik `npm.cmd` in plaats van `npm` (de execution policy blokkeert `npm.ps1`).

### Zonder camera of internet testen

Met `?mock=1` draait de app volledig op mocks: nep-boekpagina, standaardverhaal, gesimuleerd voorlezen. Extra varianten: `?mock=1&ocr=empty` (geen tekst gevonden) en `?mock=1&ocr=fail` (OCR faalt).

## Tests

```bash
npm run lint        # ESLint
npm run typecheck   # tsc -b
npm test            # 76 Vitest unit tests
npm run e2e         # Playwright e2e (draait op poort 5178 met ?mock=1)
```

Eénmalig voor e2e: `npx playwright install chromium`. CI draait alles bij elke push.

## Deployment

Elke push naar `main` bouwt en deployt automatisch naar GitHub Pages via `.github/workflows/deploy.yml` (build met `--base=/voorleesmachine/`). Alle verwijzingen naar statische assets zijn relatief, zodat de site op het Pages-subpad werkt.

## Privacy

- Foto's worden **alleen in het geheugen verwerkt** en nooit opgeslagen of verstuurd, behalve als data-URL naar OpenRouter voor de tekstherkenning.
- Geen accounts, geen analytics, geen tracking.
- De API-sleutel staat lokaal in `localStorage` en verlaat het toestel alleen richting OpenRouter.

## Projectdocumentatie

- [`AGENTS.md`](AGENTS.md) — werkafspraken voor coding agents (commands, conventies, commit-identiteit)
- [`plan.md`](plan.md) — gemaakte keuzes, uitgevoerde stappen en vervolgstappen

## Licentie

Nog geen opensource-licentie toegekend — persoonlijk project.
