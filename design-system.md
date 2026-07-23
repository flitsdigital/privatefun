# PrivateFun — Design System

Afgeleid van de **homepage** (`templates/index.json` + de custom secties). Dit is de bron van waarheid: alle andere pagina's (PDP, collectie, cart, zoek, footer-links) moeten hiernaar toe migreren. Waar iets afwijkt van dit systeem, staat het onder [Legacy / af te bouwen](#legacy--af-te-bouwen).

> Kernidee: **warm, donker, discreet, premium**. Serif-koppen (Playfair) tegen een ritme van diep-zwarte en zand/crème vlakken, met goud als enige accent. Geen ronde hoeken, geen felle kleuren, veel witruimte.

---

## 1. Kleuren

### Donker thema (primair)
| Rol | Hex | Gebruik |
|---|---|---|
| Achtergrond (ink) | `#0b0b0b` | Hoofd donkere secties, announcement bar |
| Card / tile | `#1a1a1a` | Beeldvlakken, product-tiles op donker |
| Hero espresso | `#241a0e` | Alleen de hero-achtergrond |
| Accent goud | `#c9a063` | Eyebrows, links, knoppen, iconen |
| Tekst | `#e6e3dd` | Body op donker (warm off-white) |
| Tekst (max contrast) | `#ffffff` | Hero-kop |
| Lijnen | `color-mix(in srgb, #e6e3dd 15–18%, transparent)` | Dividers, borders op donker |

### Crème thema (afwisseling)
| Rol | Hex | Gebruik |
|---|---|---|
| Achtergrond (zand) | `#f3eee1` | Crème secties (starter-picks, discretion, faq) |
| Achtergrond (warm alt) | `#f2e8cf` | Variant, iets warmer |
| Accent goud (donker) | `#a97d38` | Goud op crème — donkerder voor contrast |
| Tekst | `#1a1a1a` | Body op crème |
| Lijnen | `color-mix(in srgb, #1a1a1a 16%, transparent)` | Dividers op crème |

### Regel: goud past zich aan de achtergrond aan
- Op **donker** → `#c9a063`
- Op **crème** → `#a97d38`

### Sectie-ritme
Secties wisselen bewust donker ↔ crème af: `hero(espresso) → collection-cards(donker) → bestsellers(donker) → starter-picks(crème) → product-split(donker) → discretion(crème) → reviews(donker) → faq(crème)`.

---

## 2. Typografie

Twee fonts, globaal geregistreerd (2026-07): `config/settings_schema.json` → "Merk-lettertypes". Gebruik overal deze CSS-vars (of de font-pickers):

```css
--font-brand-display--family   /* Playfair Display */
--font-brand-body--family      /* Assistant */
--font-brand-display--weight   /* 400 */
--font-brand-body--weight      /* 400 */
```

### Koppen — **Playfair Display**, altijd `font-weight: 400`
Nooit bold. Kracht komt uit grootte + serif, niet uit gewicht.

| Rol | Grootte (desktop) | Line-height | Extra |
|---|---|---|---|
| Hero-kop | 56px | 1.05 | `letter-spacing: -0.01em` |
| Sectie-titel | 32–34px | 1.15 | — |
| Card-titel | 26px | 1.2 | — |
| Quote (reviews) | 17px | 1.5 | — |

Mobiel: sectie-titels schalen naar ±24–28px; hero naar ±38–42px.

### Body — **Assistant**, `font-weight: 400`
- Standaard body: 14–16px, line-height **1.6–1.75** (ruim).
- Intro-paragraaf onder titel: 15–16px, line-height 1.7.

### Vaste micro-stijlen (herbruikbaar door het hele systeem)
| Stijl | Specificatie |
|---|---|
| **Eyebrow** | 11–13px · uppercase · `letter-spacing: .2–.22em` · weight **500** · kleur = accent goud |
| **Knop / link-label** | 12–13px · uppercase · `letter-spacing: .1–.12em` · weight **600** |
| **Badge** | 11px · uppercase · `letter-spacing: .08–.1em` · weight **700** |
| **Mono chip** (bv. discretie-code) | `ui-monospace, Menlo, monospace` · 13px · `letter-spacing: .02em` |

---

## 3. Spacing & layout

| Token | Waarde |
|---|---|
| Max content-breedte | **1240px** (gecentreerd) |
| Horizontale padding | 24px desktop · 20px mobiel |
| Sectie verticale padding | **80–92px** desktop · ×0.7 (~56–64px) mobiel |
| Border-radius | **0** overal — knoppen, cards, inputs, badges, tiles |
| Kolom-gaps | 16–24px (grids), 32–64px (tekst/2-koloms) |

**Sharp corners zijn een systeemkeuze** — voeg nergens `border-radius` toe.

---

## 4. Knoppen

| Type | Achtergrond | Tekst | Rand | Vorm |
|---|---|---|---|---|
| **Primair (goud)** | `#c9a063` | `#0b0b0b` / `#1a1a1a` | geen | radius 0, padding `14px 30px` |
| **Secundair / ghost** | transparant | accent goud | 1px goud of tekstkleur | radius 0, padding `13px 28px` |

Alle knop-labels: 12–13px, uppercase, `letter-spacing .12em`, weight 600.
De gouden ATC-knop op de PDP volgt dit al (`#c9a063` bg, `#0b0b0b` tekst).

---

## 5. Componenten (secties)

Werkprincipe: **hergebruik deze secties, bouw geen nieuwe.** Elke sectie leest z'n eigen `color_bg / color_accent / color_text` + `font_display / font_body` + `title_size / padding_y`.

| # | Component | Bestand | Beschrijving |
|---|---|---|---|
| 0 | Announcement bar | `sections/header-announcements.liquid` | Zwarte balk, gecentreerd, 11px uppercase letterspaced. "Voor 22:00 besteld, morgen in huis — altijd discreet verpakt" |
| 1 | Hero | `sections/Hero-section.liquid` (+ native `media-with-content`) | Full-bleed espresso `#241a0e`, Playfair 56px, dubbele CTA, trust-scores (TP/Google) + USP-rij |
| 2 | Collectie-kaarten | `sections/collection-cards.liquid` | 3-koloms categorie-grid op donker; beeld + Playfair card-titel + gouden "shop"-link |
| 3 | Bestsellers | `sections/bestsellers.liquid` | Horizontale scroll-carousel met mask-fade randen; product-cards (badge · naam · prijs/was) |
| 4 | Starter-picks | `sections/starter-picks.liquid` | Crème; 2-koloms (sticky intro + genummerde lijst) |
| 5 | Product-split | `sections/product-split.liquid` | Donker; 2 naast-elkaar beeld-cards met eyebrow + titel overlay |
| 6 | Discretie | `sections/discretion.liquid` | Crème; feiten-lijst + mono "code"-chips + CTA |
| 7 | Reviews | `sections/reviews.liquid` | Donker; TP/Google-scores + quote-carousel (Playfair quotes) |
| 8 | FAQ | `sections/faq.liquid` | Crème; 2-koloms (intro + accordion-vragen) |
| 9 | Footer | `sections/footer-custom.liquid` | Merk-footer met beloftes |

### Herbruikbare bouwstenen bínnen secties
- **Eyebrow** (gouden mini-kop boven de titel) — zie §2
- **Sectie-titel** (Playfair 32–34px)
- **Primaire gouden knop** — zie §4
- **Product-card** (beeld op `#1a1a1a` · badge · naam 15px · prijs + doorgestreepte `was`)
- **Score-badge** (TP/Google: getal + label)
- **Mono-chip** (discretie)
- **Accordion** (FAQ + PDP) — titel Playfair, body Assistant, `+`-icoon, dunne dividers

---

## 6. Legacy / af te bouwen

Deze staan nog op het **basisthema** (Horizon-default) en wijken af van het merk. Dit is de migratielijst:

| Waar | Nu (off-system) | Moet worden |
|---|---|---|
| Body/heading fonts globaal | Newsreader / Red Hat Display | Playfair / Assistant |
| Standaard tekstkleur | `#4A4A4A` | `#1a1a1a` (crème) / `#e6e3dd` (donker) |
| Borders | `#E9E4E0` | `color-mix` lijnen (§1) |
| Primaire knop (theme) | `#4A4A4A` bg, witte tekst | Gouden knop (§4) |
| Sale-badge | `#7D5449` | Nog te bepalen binnen goud/ink-palet |
| Pagina-achtergrond | `#ffffff` vlak | Ink/crème-ritme |
| Winkelnaam | "Mijn winkel" | "PrivateFun" |

Pagina's die nog volledig het basisthema volgen: **collectie**, **cart**, **zoek**, **wettelijke pagina's**. PDP is deels gemigreerd (titel, accordion-fonts, gouden ATC, USP-blok).

---

## 7. Snelle checklist bij nieuw werk
- [ ] Kop = Playfair 400 · body = Assistant
- [ ] Achtergrond = ink `#0b0b0b` of crème `#f3eee1` (geen kaal wit)
- [ ] Goud = `#c9a063` (donker) of `#a97d38` (crème)
- [ ] Eyebrow / knop / badge volgen de micro-stijlen (§2)
- [ ] `border-radius: 0`
- [ ] Sectie-padding 80–92px, container max 1240px, 24px zij-padding
- [ ] Hergebruik een bestaande sectie i.p.v. nieuw bouwen
