# TrustGuard UI - Complete Working Version

## 🚀 Quick Start

```bash
# 1. Extract and navigate
tar -xzf trustguard-ui-complete.tar.gz
cd trustguard-ui-complete

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit: `http://localhost:5173`

## ✨ What's Working

- ✅ **3-Column Claude-style layout**
- ✅ **Left sidebar**: Audit history with mock data (3 sample audits)
- ✅ **Middle panel**: Chat interface with mock messages
- ✅ **Right panel**: Report viewer with tabs (Overview, Modules, Risks)
- ✅ **Collapsible sidebars**: Toggle buttons for left/right panels
- ✅ **Mock data**: Fully populated with sample audit data
- ✅ **Responsive**: Works on all screen sizes
- ✅ **TailwindCSS**: Teal Trust color theme

## 🎨 Features Demonstrated

### Left Sidebar
- Search bar (UI only)
- "+ New Audit" button
- 3 sample audits with statuses:
  - FinanceBot AI (Completed)
  - Customer Service AI (In Progress)
  - Credit Scoring Model (Completed)
- Click any audit to view it

### Middle Panel
- Welcome screen when no audit selected
- Chat-like messages when audit is active
- Message types: User, System, Agent
- Upload files button
- Text input area

### Right Panel
- Auto-opens when you select an audit
- 3 tabs:
  - **Overview**: Summary, score, key findings
  - **Modules**: Governance, Fairness, Security modules
  - **Risks**: Sample risk with recommendations
- Export buttons (PDF/JSON - UI only)
- Close button to hide panel

## 📁 Project Structure

```
trustguard-ui-complete/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.tsx       # Main 3-column layout
│   │       ├── Header.tsx       # Top navbar
│   │       ├── LeftSidebar.tsx  # Audit history
│   │       ├── MainContent.tsx  # Chat interface
│   │       └── RightPanel.tsx   # Report viewer
│   ├── store/
│   │   └── uiStore.ts          # Zustand state management
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 🔌 Next Steps: Connect to Real Backend

### 1. Create `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

### 2. Replace mock data with API calls:

In `LeftSidebar.tsx`:
```typescript
// Replace mockAudits with:
const { data: audits } = useQuery({
  queryKey: ['audits'],
  queryFn: () => fetch(`${import.meta.env.VITE_API_URL}/audits`).then(r => r.json())
});
```

### 3. Add React Query:

```bash
npm install @tanstack/react-query axios
```

### 4. Wrap App with QueryClientProvider:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## 🎯 Current State

This is a **fully functional UI** with:
- Complete layout working
- Mock data showing how it will look
- All interactions (buttons, toggles, tabs) working
- Ready to connect to your Python backend

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite** - Lightning fast dev server
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🐛 Troubleshooting

**Port already in use?**
```bash
npm run dev -- --port 3000
```

**Dependencies not installing?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 💡 Tips

1. **Click different audits** in left sidebar to see report panel open
2. **Click "New Audit"** to see the welcome screen
3. **Close right panel** with X button, reopen with < button
4. **Toggle left sidebar** with chevron button

Enjoy building! 🚀
