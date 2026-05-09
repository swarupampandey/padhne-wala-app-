# Zenith - NEET AI Learning Platform

A modern, beautiful AI-powered learning application for NEET preparation with practice questions, analytics, and intelligent tutoring.

## Features

- **Dashboard** - Real-time progress tracking and statistics
- **Practice Mode** - Interactive MCQ practice with instant feedback
- **Question Bank** - Browse and filter questions by subject and difficulty
- **Analytics** - Detailed performance metrics and learning insights
- **Settings** - Customizable preferences and account management
- **Responsive Design** - Works perfectly on all devices
- **Modern UI** - Beautiful dark theme with smooth animations

## Tech Stack

- **Framework**: Next.js 14+ (React 19)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Icons**: Lucide React
- **Deployment**: Vercel Ready

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd zenith-neet-app

# Install dependencies
npm install
# or
pnpm install
# or
yarn install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build for Production

```bash
# Build the app
npm run build

# Start production server
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main app page
│   ├── globals.css         # Global styles
│   └── providers.tsx       # App providers
├── components/
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── Header.tsx          # Top header
│   └── pages/              # Page components
│       ├── Dashboard.tsx    # Dashboard page
│       ├── Practice.tsx     # Practice questions
│       ├── QuestionBank.tsx # Question browser
│       ├── Statistics.tsx   # Analytics & stats
│       └── Settings.tsx     # User settings
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Deployment

### Deploy to Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your repository
5. Click "Deploy"

Or use the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms

This app can be deployed to any platform that supports Node.js:

- Heroku
- Railway
- Render
- AWS
- Azure
- Google Cloud
- DigitalOcean

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME=Zenith
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Add API endpoints when ready
# NEXT_PUBLIC_API_URL=https://api.example.com
```

## Development

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linter (if configured)
```

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling
- React best practices
- Component-based architecture

## Features Roadmap

- [ ] User authentication
- [ ] Database integration
- [ ] AI-powered explanations
- [ ] Progress tracking
- [ ] Study reminders
- [ ] Mobile app
- [ ] Offline mode
- [ ] Multiplayer practice

## Contributing

Contributions are welcome! Here's how to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support & Contact

For support, questions, or feedback:
- Email: support@zenith.app
- GitHub Issues: [Create an issue](https://github.com/swarupampandey/zenith-neet-app/issues)
- Twitter: [@zenithlearning](https://twitter.com/zenithlearning)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide React](https://lucide.dev/)
- Deployed on [Vercel](https://vercel.com/)

---

Made with ❤️ for NEET aspirants
