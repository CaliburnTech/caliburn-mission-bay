# Conventions

## File Naming
- Components: `PascalCase.jsx` (e.g., `ShipyardView.jsx`, `MissionPlanner.jsx`)
- Stores: `camelCaseStore.js` (e.g., `navigationStore.js`, `outfitterStore.js`)
- Data: `camelCase.js` (e.g., `vesselData.js`, `marketplaceData.js`)
- Tests: co-located as `ComponentName.test.jsx` or `storeName.test.js`
- Hooks: `useCamelCase.js` (e.g., `useMountPointDragDrop.js`)

## Component Structure
```jsx
// 1. React imports
import React, { useState, useEffect } from 'react';
// 2. Library imports (icons, etc.)
import { Ship, Target } from 'lucide-react';
// 3. Data imports
import { vesselHullData } from '../data/vesselData';
// 4. Store imports
import useNavigationStore from '../store/navigationStore';
// 5. Component imports
import VesselStatsDisplay from './VesselStatsDisplay';
// 6. Asset imports
import logo from '../assets/images/logo.png';

const ComponentName = ({ prop1, prop2 }) => {
  // Stores first
  const { selectedView } = useNavigationStore();
  // Local state
  const [value, setValue] = useState(null);
  // Effects
  useEffect(() => { /* ... */ }, []);
  // Handlers
  const handleClick = () => { /* ... */ };
  // Render
  return (<div>...</div>);
};

export default ComponentName;
```

## Zustand Store Pattern
```jsx
import { create } from 'zustand';

const useExampleStore = create((set, get) => ({
  // State
  items: [],
  selectedItem: null,

  // Actions (named set*)
  setSelectedItem: (item) => set({ selectedItem: item }),

  // Computed (named get*)
  getFilteredItems: () => {
    const { items } = get();
    return items.filter(/* ... */);
  },
}));

export default useExampleStore;
```

## Styling
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin — no `tailwind.config.js`
- Color constants in `src/constants/colors.js` — each has `hex` (for dynamic), `tw` (for classes)
- Never hardcode hex values in components — always import from `colors.js`
- Dark theme by default (defense UI aesthetic)

## Error Handling
- localStorage: wrapped in try/catch with silent failure (private browsing support)
- Component-level: early returns for missing data (`if (!selectedHull) return null`)
- No error boundaries currently — add for production robustness

## Testing
- **Framework**: Vitest + Testing Library + jsdom
- **Setup**: `src/test/setup.js` (imported via `vitest.config.js`)
- **Globals**: `vi`, `describe`, `it`, `expect`, `beforeEach` available globally
- **Store mocking**: Use `vi.mock('../store/storeName')` — return object with `default` function
- **Data mocking**: Use `vi.mock('../data/dataFile')` — return minimal shape matching real data

## ESLint Rules (Notable)
- `no-unused-vars`: errors, but ignores vars starting with uppercase or underscore
- JSX: strict formatting — closing bracket location, tag spacing, curly spacing, boolean shorthand
- React: no unknown properties, no deprecated APIs, no string refs, pascal-case components
- `react/prop-types`: off (TypeScript checking handles type safety)

## Git
- Single `main` branch
- Pre-commit: lint + typecheck (Husky)
- Conventional commit prefixes: `feat:`, `fix:`, `refactor:`, etc.

## Known Technical Debt
- Large files needing decomposition: `marketplaceData.js` (2,658 lines), `OutfitterView.jsx` (795), `ShipyardView.jsx` (686)
- Only 2 test files — stores and critical components need test coverage
- Backup directories in repo should be removed (use git history instead)
- `.gitignore` missing `.env` patterns
- No React error boundaries
