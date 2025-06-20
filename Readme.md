# 🏥 Med-AI - Intelligent Healthcare Management System

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Overview

Med-AI is a comprehensive healthcare management system powered by artificial intelligence. It provides healthcare professionals with advanced tools for patient management, medical diagnostics, prescription management, and health monitoring using cutting-edge AI technologies.

## ✨ Features

### 🤖 AI-Powered Healthcare
- **Medical Image Analysis**: Advanced AI analysis of medical images and scans
- **Symptom Analysis**: Intelligent symptom checker with AI-driven insights
- **Smart Diagnostics**: AI-assisted diagnostic recommendations
- **Prescription Intelligence**: AI-powered prescription management and drug interaction checking

### 👥 Patient Management
- **Patient Records**: Comprehensive patient information management
- **Health Monitoring**: Real-time vital signs tracking and monitoring
- **Medical History**: Complete medical history with timeline view
- **Appointment Scheduling**: Integrated appointment management system

### 👨‍⚕️ Doctor Dashboard
- **Doctor Profiles**: Comprehensive doctor information and specializations
- **Patient Assignment**: Efficient patient-doctor assignment system
- **Medical Notes**: Structured medical note-taking with templates
- **Analytics**: Healthcare analytics and reporting

### 🚨 Emergency Features
- **Emergency Response**: Quick access emergency protocols
- **Critical Alerts**: Real-time critical patient alerts
- **Emergency Contacts**: Instant access to emergency contacts

### 💊 Prescription Management
- **Digital Prescriptions**: Electronic prescription creation and management
- **Drug Database**: Comprehensive medication database
- **Interaction Checker**: AI-powered drug interaction warnings
- **Dosage Calculator**: Smart dosage recommendations

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: 
  - Google Gemini AI
  - Hugging Face Transformers
  - Medical LLMs (MedGemma)
- **Model Context Protocol**: Custom MCP implementation for AI model integration

### Key Components
```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Authentication pages
│   ├── doctors/           # Doctor management
│   ├── patients/          # Patient management
│   ├── prescriptions/     # Prescription system
│   ├── emergency/         # Emergency features
│   └── AI-dashboard/      # AI analytics dashboard
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── providers/             # Context providers
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account
- Google AI API key
- Hugging Face API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PratyushKumar43/MedAI.git
   cd MedAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local` file with:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Google AI Configuration
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   
   # Hugging Face Configuration
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   HUGGINGFACE_MEDICAL_TEXT_MODEL=google/medgemma-27b-text-it
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Run the database setup script
   npm run db:setup
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Database Setup
The application uses Supabase as the backend database. Run the provided SQL scripts to set up the required tables:

```bash
# Setup main database schema
psql -f scripts/setup-database.sql

# Add patient vitals support
psql -f scripts/add-vitals-support.sql

# Enhance prescription database
psql -f scripts/enhance-prescription-database.sql
```

### AI Model Configuration
Configure your AI models in the environment variables:
- **Google Gemini**: For general AI capabilities
- **Hugging Face Medical Models**: For specialized medical AI features
- **Custom MCP Server**: For model context protocol integration

## 📚 API Documentation

### Key API Endpoints

#### Patient Management
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get patient details
- `PUT /api/patients/[id]` - Update patient information

#### Medical AI
- `POST /api/medical-image-analysis` - Analyze medical images
- `POST /api/symptom-analysis` - Analyze symptoms
- `POST /api/test-python-medgemma` - Test medical AI models

#### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/[id]` - Update prescription

## 🔐 Security Features

- **Authentication**: Secure user authentication with Supabase Auth
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: End-to-end encryption for sensitive medical data
- **HIPAA Compliance**: Healthcare data privacy and security standards
- **API Security**: Protected API endpoints with authentication middleware

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first responsive design
- **Dark/Light Mode**: Theme switching capability
- **Accessibility**: WCAG 2.1 compliant
- **Modern UI**: Clean, intuitive interface with Radix UI components
- **Real-time Updates**: Live data updates and notifications

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 📦 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```bash
# Build Docker image
docker build -t med-ai .

# Run container
docker run -p 3000:3000 med-ai
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/PratyushKumar43/MedAI/wiki)
- **Issues**: [GitHub Issues](https://github.com/PratyushKumar43/MedAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/PratyushKumar43/MedAI/discussions)

## 🚀 Roadmap

- [ ] Mobile Application (React Native)
- [ ] Telemedicine Integration
- [ ] Advanced ML Models
- [ ] IoT Device Integration
- [ ] Multi-language Support
- [ ] API Rate Limiting
- [ ] Advanced Analytics Dashboard
- [ ] Integration with Hospital Systems

## 👨‍💻 Author

**Pratyush Kumar**
- GitHub: [@PratyushKumar43](https://github.com/PratyushKumar43)
- LinkedIn: [Your LinkedIn Profile]

## 🙏 Acknowledgments

- Google AI for Gemini API
- Hugging Face for Medical AI Models
- Supabase for Backend Infrastructure
- Vercel for Deployment Platform
- The Open Source Community

---

⭐ **Star this repository if you find it helpful!**

*Med-AI - Transforming Healthcare with Artificial Intelligence*