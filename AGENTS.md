# AGENTS.md — Voorleesmachine

Lees dit bestand vóór elke taak en volg de afspraken exact op.

## Project

"Voorleesmachine": een PWA voor kinderen die met één knop een foto maakt van een boekpagina, de tekst via AI (OpenRouter, model Gemini Flash) herkent en die in het Nederlands voorleest (Web Speech API). De UI is volledig icon-only: grote knoppen, geen tekst. Kinderen zijn de gebruiker — eenvoud, directe feedback en privacy (foto's worden na verwerking weggegooid, niets bewaard) staan voorop.

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck + productiebuild
- `npm run lint` — ESLint (moet foutloos slagen)
- `npm run typecheck` — `tsc -b` (moet foutloos slagen)
- `npm test` — Vitest unit tests (moeten slagen)
- `npm run e2e` — Playwright end-to-end tests (moeten slagen)

Gebruik `npm.cmd` i.p.v. `npm` in PowerShell (execution policy blokkeert `npm.ps1`).

## Regels

- TypeScript strict; geen `any`; imports van types met `import type` (verbatimModuleSyntax staat aan).
- GEEN code-comments, tenzij expliciet gevraagd.
- Services (camera / OCR / TTS) zijn altijd achter interfaces in `src/services/`; de UI kent alleen de interfaces. Unit- en e2e-tests gebruiken de mocks uit `src/services/mock/`.
- UI is volledig icon-only: geen zichtbare tekstlabels in kind-schermen. Elk interactief element krijgt een Nederlandse `aria-label` (toegankelijkheid + testbaarheid). Aanraakvlakken minimaal 64×64 px, voorkeur veel groter.
- Mock-modus: met query-param `?mock=1` draait de app volledig op mocks (geen camera/mic/netwerk nodig). Elke nieuwe service móét in mock-modus werken; e2e-tests draaien altijd met `?mock=1`.
- Voordat je commit: `npm run lint`, `npm run typecheck` en `npm test` slagen. Eén commit per afgeronde stap, in het Engels, conventionele stijl (`feat:`, `chore:`, `test:` …).
- Geheimen (OpenRouter API-key) nooit in code of commits; de key staat uitsluitend in localStorage via het ouders-menu.
- Geen nieuwe dependencies zonder expliciete opdracht; houd de bundle klein.
- Foutafhandeling is icon-only: elke fouttoestand heeft een eigen pictogram + grote herstelknop.

## Structuur

- `src/domain/` — types, state machine en pure logica (uitgebreid unit-getest)
- `src/services/` — interfaces en implementaties: `camera/`, `ocr/`, `tts/` + `mock/`
- `src/components/` — schermen en herbruikbare bouwstenen
- `src/parents/` — verborgen ouders-instellingen (API-key, model)
- `e2e/` — Playwright e2e-tests (draaien met `?mock=1`)
- `src/test/` — test-setup en helpers

## Proces

Werk stapsgewijs volgens de actuele stappenlijst uit het gesprek; één stap voltooien = tests groen = commit. Houd dit bestand up-to-date wanneer structuur of regels veranderen.
