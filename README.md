
# � Market Explorer

A modern, interactive financial market calendar application built with React and Redux, featuring real-time Binance trading data visualization and comprehensive export capabilities.

![Market Explorer](https://img.shields.io/badge/React-18.x-blue.svg)
![Redux](https://img.shields.io/badge/Redux-Toolkit-purple.svg)
![Vite](https://img.shields.io/badge/Vite-5.x-yellow.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

### 🗓️ **Interactive Calendar**
- **Multi-View Support**: Month, Week, and Day views
- **Keyboard Navigation**: Full accessibility with arrow keys
- **Responsive Design**: Optimized for all screen sizes
- **Glass Morphism UI**: Modern, sleek interface with backdrop blur effects

### 💰 **Binance Integration**
- **15+ Trading Pairs**: Major cryptocurrencies, altcoins, DeFi tokens, Layer2, and meme coins
- **Real-time Data**: Live market data integration
- **Categorized Instruments**: Organized by Major, Altcoin, DeFi, Layer2, and Meme categories
- **Dynamic Switching**: Seamless instrument selection with loading states

### 📈 **Market Data Visualization**
- **Volatility Tracking**: Daily volatility calculations and visualization
- **Volume Analysis**: Trading volume display and trends
- **Performance Metrics**: Daily price change percentages with color coding
- **OHLC Data**: Open, High, Low, Close price information

### � **Export Capabilities**
- **CSV Export**: Structured data export with metadata
- **PDF Generation**: Professional reports with styling
- **Image Export**: High-quality PNG charts with canvas rendering
- **Custom Formatting**: Instrument-specific export naming and content

### 🎨 **User Experience**
- **Portal-based Dropdowns**: No overflow issues with advanced positioning
- **Loading States**: Smooth transitions and feedback
- **Error Handling**: Graceful error management with user feedback
- **Accessibility**: ARIA labels and keyboard navigation support

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Modern Browser** with ES6+ support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pani2004/Market-Explorer.git
   cd Market-Explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
# or
yarn build
```

## 🏗️ Project Structure

```
Market-Explorer/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   └── calendar/
│   │       ├── Calendar.jsx          # Main calendar component
│   │       ├── CalendarHeader.jsx    # Navigation and controls
│   │       ├── CalendarBody.jsx      # Calendar grid display
│   │       └── ViewToggleButtons.jsx # View mode switches
│   ├── assets/
│   │   └── react.svg
│   ├── App.jsx                       # Root application component
│   ├── App.css                       # Global styles
│   ├── main.jsx                      # Application entry point
│   └── index.css                     # Base CSS styles
├── eslint.config.js                  # ESLint configuration
├── vite.config.js                    # Vite build configuration
├── package.json                      # Project dependencies
└── README.md                         # Project documentation
```

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 18.x**: Modern React with hooks and functional components
- **Redux Toolkit**: State management for market data
- **React Portal**: Advanced dropdown positioning

### **Build Tools**
- **Vite**: Fast development server and build tool
- **ESLint**: Code quality and consistency

### **Styling**
- **Tailwind CSS**: Utility-first CSS framework
- **Custom CSS**: Component-specific styling
- **Glass Morphism**: Modern UI effects

### **Icons & UI**
- **Lucide React**: Modern icon library
- **Responsive Design**: Mobile-first approach

### **Data & API**
- **Binance API**: Cryptocurrency market data
- **Day.js**: Date manipulation and formatting

## 🎯 Usage

### **Calendar Navigation**
- Use **arrow keys** to navigate between dates
- **Enter** to select a date
- **Escape** to close menus
- Click **view toggle buttons** to switch between Month/Week/Day views

### **Instrument Selection**
1. Click the **Filter button** (purple button in header)
2. Browse trading pairs by category
3. Select your desired instrument
4. Data will automatically load for the selected pair

### **Exporting Data**
1. Click the **Export button** (blue button in header)
2. Choose your preferred format:
   - **CSV**: Structured data with headers
   - **PDF**: Professional report format
   - **Image**: Visual chart representation

### **Supported Trading Pairs**

| Category | Instruments |
|----------|-------------|
| **Major** | BTC/USDT, ETH/USDT, BNB/USDT, LTC/USDT |
| **Altcoin** | ADA/USDT, SOL/USDT, XRP/USDT, DOT/USDT, ATOM/USDT |
| **DeFi** | AVAX/USDT, LINK/USDT, UNI/USDT, FTM/USDT |
| **Layer2** | MATIC/USDT |
| **Meme** | DOGE/USDT |

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file in the root directory:

```env
VITE_BINANCE_API_URL=https://api.binance.com/api/v3
VITE_BINANCE_WS_URL=wss://stream.binance.com:9443/ws
```

### **Customizing Trading Pairs**
Edit the `binanceInstruments` array in `Calendar.jsx`:

```javascript
const binanceInstruments = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'Major' },
  // Add more instruments here
];
```

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Desktop**: Full feature set with large calendar grid
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Compact view with essential features
- **Accessibility**: Screen reader support and keyboard navigation

## 🔍 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Development Guidelines**
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint checks |


## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Binance API** for market data
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first approach
- **Lucide** for beautiful icons
- **Vite** for lightning-fast development

## � Support

For support and questions:

- **GitHub Issues**: [Create an issue](https://github.com/pani2004/Market-Explorer/issues)
- **Email**: [Contact maintainer](mailto:pani2004@example.com)
- **Documentation**: [Wiki](https://github.com/pani2004/Market-Explorer/wiki)

---

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [pani2004](https://github.com/pani2004)

