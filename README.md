# Simple Fitness Tracker

A minimalist HIIT workout timer with a focus on readability and ease of use during workouts.

## Features

- **Two-Screen Interface**: Configuration screen and full-screen timer
- **Exercise Management**: Add, edit, and remove exercises with custom work/rest times
- **Visual Timer**: Large countdown display with color-coded phases (green for work, red for rest)
- **Sound Effects**: Audio cues for phase changes, countdown, and workout completion
- **Keyboard Shortcuts**:
  - Space: Pause/Resume
  - Arrow Left/Right: Previous/Next exercise
- **Data Persistence**: Configuration saved to localStorage
- **Responsive Design**: Works on desktop and mobile

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to the local development URL

## Usage

### Configuration Screen
1. Add exercises using the "+ Add Exercise" button
2. Set exercise names, work time, and rest time for each exercise
3. Click "Start Workout" to begin

### Timer Screen
- Large countdown timer in the center
- Color-coded background (green = work, red = rest)
- Exercise name and progress indicator
- Pause/Resume and Stop controls
- Keyboard shortcuts for quick navigation

## Tech Stack

- React 19
- TypeScript
- Vite 6
- Web Audio API for sound effects
- localStorage for data persistence

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Application styles
├── utils/
│   └── audio.ts     # Audio management utility
└── main.tsx         # Application entry point
```

## Future Enhancements

- Voice guidance
- Dark mode
- Workout presets (Tabata, AMRAP, etc.)
- Workout history and statistics
- Export/import workout configurations
- Smartwatch integration
