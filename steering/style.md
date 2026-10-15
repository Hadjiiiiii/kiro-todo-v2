# Styling Conventions

## Design System

The app uses a **warm dark theme** inspired by Claude's aesthetic — terracotta/clay accents on warm near-black backgrounds.

### Color Tokens (defined in `src/constants/index.js`)

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#141413` | App background |
| `surface` | `#1f1e1d` | Panels, rails |
| `surfaceHover` | `#262624` | Hover states |
| `elevated` | `#2b2a27` | Dialogs, popovers |
| `text` | `#faf9f5` | Primary text (warm cream) |
| `textSecondary` | `#b0aea5` | Secondary text |
| `textMuted` | `#8a887f` | Muted/captions |
| `accent` | `#d97757` | Primary accent (terracotta) |
| `accentHover` | `#c15f3c` | Accent hover state |
| `blue` | `#6a9bcc` | Secondary accent |
| `green` | `#788c5d` | Success/positive |

### Priority Colors

- **High** — `#d97757` (terracotta)
- **Medium** — `#d9a441` (warm amber)
- **Low** — `#788c5d` (warm green)

### Category Colors

- Work: `#d97757`, Personal: `#6a9bcc`, Shopping: `#c98a5e`, Health: `#788c5d`, Learning: `#d9a441`
- Dynamic categories cycle through `CATEGORY_COLOR_PALETTE`

## Styling Approach

### MUI + `sx` Prop

- Components are styled primarily using MUI's `sx` prop (inline style objects)
- The MUI theme is configured in `main.jsx` with the custom color palette
- No separate CSS modules or styled-components per file

### MUI Theme Customization

- **Dark mode** palette with custom primary (terracotta) and secondary (blue) colors
- Typography uses:
  - Headings: `'Fraunces'` serif font
  - Body: `'Inter'` sans-serif font
- Custom border radius and component overrides set in theme

### Global CSS (`src/index.css`)

- Universal reset (`* { margin: 0; padding: 0; box-sizing: border-box }`)
- Body: dark background, overflow hidden, font smoothing enabled
- Subtle warm vignette gradient via `body::before` pseudo-element
- Custom scrollbar styling (warm transparent theme)
- No Tailwind or utility CSS classes

### Surface Tokens (GLASS / SURFACE export)

- Flat surfaces — no blur or glassmorphism despite the `GLASS` export name
- Use `SURFACE.background`, `SURFACE.border`, `SURFACE.shadow` for consistent panels

## Conventions

1. **Use design tokens** from `constants/index.js` — never hardcode colors in components
2. **MUI `sx` prop** for all component styling
3. **Responsive**: use `useMediaQuery` for layout switching; avoid CSS media queries
4. **Border radius**: use `THEME.radius` (12px), `THEME.radiusLg` (16px), `THEME.radiusXl` (20px)
5. **Shadows**: use `THEME.shadow` or `THEME.shadowLight` for elevation
6. **Borders**: use `THEME.border` (subtle 8% white) or `THEME.borderStrong` (14% white)
7. **Typography hierarchy**: serif headings (h3+), sans-serif for body/UI text
8. **Component pattern**: functional components with MUI Box/Stack for layout, Typography for text
