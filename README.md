# LiveInsight 🚀

[![Dynamic Portfolio](https://img.shields.io/badge/Dynamic-Portfolio-4ade80)](https://github.com/lakshya-jain-0291/PortFolio)
[![Powered by](https://img.shields.io/badge/Powered%20by-React%20+%20TypeScript-61dafb)](https://github.com/lakshya-jain-0291/PortFolio)
[![Data Source](https://img.shields.io/badge/Data-JSON%20+%20GitHub%20API-333333)](https://github.com/lakshya-jain-0291/PortFolio)

A modern, cyberpunk-inspired developer portfolio that automatically updates based on your GitHub activity, resume, and personal information. This portfolio is designed to evolve with your career, reducing maintenance overhead while providing a professional showcase of your work.

![Portfolio Preview](./assets/portfolio-preview.png)

## ✨ Features

- **🤖 Auto-Generated Content** - Portfolio data is automatically generated from your resume and GitHub profile
- **🔄 Dynamic Updates** - Data refreshes from APIs to always show your latest work
- **🌐 GitHub Integration** - Displays repositories, stars, contributions, and commit activity
- **📊 Interactive Stats** - Visual representations of your GitHub activity and technical skills
- **📱 Responsive Design** - Looks great on all devices with a cyberpunk-inspired dark theme
- **🎨 Customizable** - Easy to modify content by editing the portfolio.json file
- **🔒 Local Storage** - Stores portfolio data locally for faster loading

## 🛠️ Technology Stack

![React](https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?style=flat&logo=tailwind-css&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/-shadcn/ui-000000?style=flat&logo=shadcnui&logoColor=white)

## 🔍 How It Works

LiveInsight uses a simple yet powerful data flow system:

1. **Initial Load**
    - Checks for local portfolio data
    - If not found, fetches from your GitHub profile

2. **Data Processing**
    - Parses your resume PDF (when uploaded)
    - Fetches GitHub repositories and statistics
    - Combines all data into a coherent portfolio model

3. **Storage Layer**
    - Saves processed data to local storage
    - Minimizes API calls to GitHub

4. **Rendering Pipeline**
    - Components consume the portfolio data model
    - Updates UI when data changes
    - Applies cyberpunk styling to all elements

<p align="center">
    <img src="./assets/portfolio-flow.png" alt="Portfolio Data Flow Diagram" width="80%" style="max-width: 600px;">
</p>


5. **Update Mechanism**
    - Manual refresh button for on-demand updates
    - Scheduled background refreshes for latest GitHub data


## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Portfolio Automation API key (see below)

### API Key Setup
1. Visit [portfolio-automation.dev](https://portfolio-automation.dev)
2. Create a free account or log in
3. Navigate to your dashboard and generate a new API key
4. Copy your API key for the next steps

### Installation

1. Clone the repository
```bash
git clone https://github.com/username/PortFolio.git
cd PortFolio
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a .env file based on .env.example
```bash
cp .env.example .env
```

4. Add your Portfolio Automation API key to the .env file
### Getting an API Key
- Visit [portfolio-automation.dev](https://portfolio-automation.dev)
- Create a free account or log in
- Navigate to the dashboard and click "Generate API Key"
- Copy your new API key and paste it into your .env file
- Your portfolio will now automatically sync with your GitHub profile

```
PORTFOLIO_AUTOMATION_API_KEY=your_api_key_here
```




5. Start the development server
```bash
npm run dev
# or
yarn dev
```

## 📊 Data Management

### Automatic Data Generation

Your portfolio data is automatically generated from:

1. **GitHub Profile** - Projects, stats, stars, and activity
2. **Resume PDF** - Education, experience, and skills
3. **Portfolio Automation API** - Enhances and structures your profile data

### Customizing Your Data

The portfolio.json file controls all displayed content. You can:

1. **Download your data**: Click the Star icon in the header and select "Download Portfolio Data"
2. **Edit the JSON file**: Modify any fields in the downloaded JSON
3. **Place in the data directory**: Save your edited file as portfolio.json
4. **Refresh the page**: Your changes will be automatically loaded

## 📁 Project Structure

```
PortFolio/
├── public/
│   ├── portfolio-service-worker.js  # Handles saving portfolio data
│   └── data/                        # Directory for portfolio.json
├── src/
│   ├── components/                  # UI components
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Utility functions
│   │   ├── portfolioStorage.ts      # Data storage functionality
│   │   ├── portfolioReader.ts       # Data reading functionality
│   │   └── githubService.ts         # GitHub API integration
│   └── config/                      # Configuration files
└── data/
    └── portfolio.json               # Your portfolio data
```

## 🔄 Update Workflow

1. **Automatic Updates**:
   - When your GitHub profile changes, refresh your portfolio to see the latest stats
   - Upload a new resume to update your education and experience

2. **Manual Updates**:
   - Edit the portfolio.json file directly
   - Place it in the data directory
   - Reload the page to see changes

## 🌟 Key Features in Detail

### Dynamic GitHub Stats
- Repository count
- Star count
- Forks count
- Commit activity
- Contribution graph
- Top languages

### Interactive Project Showcase
- Featured projects section
- Filtering and search capabilities
- GitHub stats integration
- Technologies used tags

### Professional Experience Timeline
- Visual timeline of work history
- Achievement highlights
- Company information

### Technical Skills Showcase
- Auto-categorized skill sets
- Proficiency indicators
- Professional tech stack visualization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  <a href="#top">Back to top</a>
</p>

