# Caliburn Mission Bay Marketplace

A React web application for the Caliburn Mission Bay defense technology marketplace.

## Project Structure

```
src/
├── components/          # React components
├── assets/             # Static assets
│   ├── images/         # Logo, images (drop your files here)
│   └── icons/          # Additional icons
├── styles/             # CSS stylesheets
│   └── globals.css     # Caliburn brand colors and global styles
├── App.jsx             # Main app component
├── App.css             # App-specific styles
├── index.css           # Root styles with brand integration
└── main.jsx            # React app entry point
```

## Brand Colors

The project is configured with Caliburn brand colors:

- **Primary Brand**: `#cbfd00` (lime green)
- **Dark Background**: `#2a3844`
- **Darker Panels**: `#1a2530`
- **Text**: `#ffffff` (white)
- **Secondary Text**: `#94a3b8` (gray)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173/`

## Adding Assets

- Drop your logo files into `src/assets/images/`
- Import them in components like: `import logo from '../assets/images/logo.png'`

## Dependencies

- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **lucide-react** - Icon library (currently using Shield icon as placeholder)

## Next Steps

The project is ready for you to:
1. Add your brand assets to `src/assets/images/`
2. Replace the placeholder Shield icon with your actual logo
3. Add your full component code for the marketplace features

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally