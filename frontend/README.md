# GCC Data Extractor - Frontend

A modern React/Next.js frontend for the GCC Data Extractor system with real-time monitoring, dark mode support, and a beautiful UI built with Tailwind CSS and shadcn/ui.

## Features

- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- 🌓 **Dark Mode**: Full dark mode support with theme toggle
- 📊 **Real-time Monitoring**: Live updates of extraction progress
- 📈 **Statistics Dashboard**: View success rates, extraction counts, and more
- 🔧 **Configuration Panel**: Easy configuration management
- 📋 **Data Table**: View extracted company data in real-time
- 📝 **Logs Viewer**: Monitor system logs and errors
- ⬇️ **Export**: Download results as Excel files

## Tech Stack

- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Theme**: next-themes
- **API Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Python backend running on `http://localhost:5000`

### Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file (optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── layout.tsx       # Root layout with theme provider
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── dashboard.tsx    # Main dashboard
│   │   ├── config-panel.tsx # Configuration panel
│   │   ├── data-table.tsx   # Data display table
│   │   ├── logs-viewer.tsx  # Logs viewer
│   │   ├── stats-cards.tsx  # Statistics cards
│   │   ├── mode-toggle.tsx  # Dark mode toggle
│   │   └── theme-provider.tsx
│   └── lib/
│       ├── api.ts           # API client and types
│       └── utils.ts         # Utility functions
├── package.json
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── next.config.js           # Next.js configuration
```

## Components Overview

### Dashboard
The main component that orchestrates the entire UI. Features:
- Real-time status updates
- Control buttons (Start/Stop/Download)
- Progress tracking
- Statistics display
- Tabbed interface for data and logs

### Config Panel
Allows users to configure:
- Input/output file paths
- Template file
- Batch size
- Max retries
- Response timeout

### Data Table
Displays extracted company data with:
- Company information
- Industries (as badges)
- Revenue
- GBS status
- GCC units and locations
- Responsive design

### Logs Viewer
Shows system logs with:
- Log level indicators (Error, Warning, Info)
- Timestamps
- Color-coded messages
- Auto-scroll

### Stats Cards
Display key metrics:
- Session ID
- Successful extractions
- Failed extractions
- Success rate

## API Integration

The frontend communicates with the Python backend via REST API:

- `POST /start` - Start extraction
- `POST /stop` - Stop extraction
- `GET /status` - Get current status
- `GET /data` - Get extracted data
- `GET /logs` - Get system logs
- `GET /config` - Get configuration
- `POST /config` - Update configuration
- `GET /download` - Download results
- `POST /upload` - Upload files

## Building for Production

```bash
npm run build
npm start
```

## Customization

### Adding New Components

To add new shadcn/ui components:

```bash
npx shadcn-ui@latest add [component-name]
```

### Styling

All styles use Tailwind CSS. Global theme colors are defined in `src/app/globals.css`.

### Dark Mode

Dark mode is implemented using `next-themes` and can be toggled via the sun/moon icon in the header.

## Troubleshooting

### API Connection Issues

If the frontend can't connect to the backend:
1. Ensure the Python backend is running on port 5000
2. Check CORS settings in the backend
3. Verify the API URL in `.env.local`

### Build Errors

If you encounter build errors:
1. Delete `.next` folder and `node_modules`
2. Run `npm install` again
3. Clear browser cache

## License

This project is part of the GCC Data Extractor system.


