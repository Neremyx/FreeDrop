# FreeDrop - Free Games & Loot Notifier

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Neremyx/FreeDrop)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen.svg)](https://developer.chrome.com/docs/extensions/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

**FreeDrop** is a Chrome extension that keeps you informed about free games and loot offers from various gaming platforms. Never miss a free game again with desktop notifications and a clean, organized popup interface.

## ✨ Features

- 🎮 **Multi-Platform Support**: Track giveaways from Steam, Epic Games Store, GOG, PlayStation, Xbox, and more
- 🔔 **Smart Notifications**: Get desktop notifications for new giveaways matching your preferences
- ⚙️ **Customizable Filters**: Choose specific platforms and giveaway types (games, loot, beta access)
- 🕒 **Efficient Updates**: Automatic refresh every 5 minutes with intelligent caching
- 🎨 **Clean Interface**: Beautiful, lightweight popup with FontAwesome icons
- 📱 **Responsive Design**: Works seamlessly across different screen sizes
- 🚀 **Manifest V3**: Built with the latest Chrome extension standards

## 🚀 Installation

### Manual Installation (Developer Mode)

1. **Download the Extension**

   ```bash
   git clone https://github.com/Neremyx/FreeDrop.git
   cd FreeDrop
   ```

2. **Load in Chrome**

   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the project folder
   - The extension icon will appear in your toolbar

3. **Initial Setup**
   - Click the FreeDrop icon in your toolbar
   - The configuration page will open automatically
   - Select your preferred platforms and giveaway types
   - Enable/disable notifications as desired

> **Note**: This is an open-source Chrome extension available only through GitHub.

## 🎯 Configuration

On first install, FreeDrop will automatically open the configuration page. You can also access it anytime by:

- Right-clicking the extension icon and selecting "Options"
- Clicking the settings gear icon in the popup

### Platform Options

Choose from 15+ gaming platforms including:

- **PC Platforms**: Steam, Epic Games Store, GOG, Ubisoft Connect, EA Origin, Battle.net
- **Consoles**: PlayStation 4/5, Xbox One/Series X|S, Nintendo Switch
- **Mobile**: Android, iOS
- **Other**: VR, DRM-Free games

### Giveaway Types

- **Full Games**: Complete games that are free to keep permanently
- **In-Game Loot**: Skins, items, and in-game content
- **Beta Access**: Early access to upcoming games

### Notifications

- Toggle desktop notifications on/off
- Notifications appear for new giveaways matching your filters
- Auto-dismiss after 10 seconds

## 📱 Usage

### Popup Interface

Click the FreeDrop icon in your Chrome toolbar to see:

- **Active giveaways** filtered by your preferences
- **Game thumbnails** and titles
- **Original prices** (crossed out) followed by "FREE"
- **Platform information** for each giveaway
- **Direct links** to claim offers
- **Last updated** timestamp

### Notifications

When new giveaways matching your filters are detected:

- Desktop notification appears with game title and value
- Click notification or "View Details" to open the popup
- Notifications respect your system's Do Not Disturb settings

## 🔧 Technical Details

### API Integration

FreeDrop uses the [GamerPower API](https://www.gamerpower.com/api) to fetch giveaway data:

- **Base URL**: `https://www.gamerpower.com/api`
- **Endpoints**: `/giveaways` and `/filter` for different query types
- **Filtering**: Supports platform and type filtering via URL parameters
- **Rate Limiting**: Respects API rate limits with built-in delays
- **Caching**: Smart caching system prevents unnecessary API calls (5-minute cache)

### Performance Optimizations

- **Smart Caching**: Data is cached for 5 minutes to reduce API calls
- **Background Processing**: Service worker handles updates efficiently
- **Minimal Resource Usage**: Lightweight code with optimized asset loading
- **Error Handling**: Graceful fallbacks for network issues

### Privacy & Security

- **No Data Collection**: FreeDrop doesn't collect or store personal data
- **Local Storage Only**: All preferences stored locally on your device
- **HTTPS Only**: All API communications use secure HTTPS
- **Minimal Permissions**: Only requests necessary Chrome permissions

## 🛠️ Development

### Prerequisites

- Chrome browser (version 88+)
- Basic knowledge of JavaScript and Chrome extension development

### Project Structure

````
FreeDrop/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker for background tasks
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styles
├── config.html           # Settings/configuration page
├── config.js             # Settings functionality
├── config.css            # Settings styles
├── icons/                # Extension and platform icons
│   ├── icon16.png        # 16x16 extension icon
│   ├── icon32.png        # 32x32 extension icon
│   ├── icon48.png        # 48x48 extension icon
│   ├── icon128.png       # 128x128 extension icon
│   └── [platform-icons]  # Custom platform icons (PNG format)
├── README.md             # Project documentation
├── LICENSE              # MIT License file
└── .gitignore           # Git ignore rules
```### Building & Testing

1. **Clone and Setup**

   ```bash
   git clone https://github.com/Neremyx/FreeDrop.git
   cd FreeDrop
````

2. **Load in Chrome**

   - Navigate to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked" and select the project folder

3. **Testing Checklist**

   - [ ] Extension loads without errors
   - [ ] Configuration page opens on first install
   - [ ] Platform and type filtering works
   - [ ] Notifications appear for new giveaways
   - [ ] Popup displays giveaways correctly
   - [ ] Click-to-open functionality works
   - [ ] Settings persist between sessions

4. **Debugging**
   - Use Chrome DevTools for popup debugging
   - Check service worker logs in `chrome://extensions/`
   - Monitor network requests in the DevTools Network tab

### Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**

   ```bash
   git fork https://github.com/Neremyx/FreeDrop.git
   ```

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**

   - Follow the existing code style
   - Test your changes thoroughly
   - Update documentation if needed

4. **Submit a Pull Request**
   - Provide a clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues

**Development Guidelines:**

- Use ES6+ JavaScript features
- Follow Chrome Extension Manifest V3 standards
- Maintain responsive design principles
- Test across different screen sizes

## 📋 Roadmap

- [ ] **Custom Refresh Intervals**: Allow users to set custom update frequencies
- [ ] **Price Alerts**: Notify when games drop below a certain price
- [ ] **Wishlist Integration**: Sync with Steam/Epic wishlists
- [ ] **Historical Data**: Track price history for games
- [ ] **Export Features**: Export giveaway lists to various formats
- [ ] **Dark Mode**: Add dark theme option
- [ ] **Multiple Languages**: Internationalization support

## 🐛 Known Issues

- Some game thumbnails may fail to load due to CORS restrictions
- Notification appearance and behavior varies by operating system
- Large giveaway datasets (50+ items) may cause minor performance impact
- Custom platform icons require manual creation (7 PNG files needed)

## 🔧 Troubleshooting

### Extension Not Loading

- Ensure Developer mode is enabled in `chrome://extensions/`
- Check for JavaScript errors in the Console
- Verify all files are present in the project directory

### No Notifications Appearing

- Check Chrome notification permissions
- Verify notifications are enabled in extension settings
- Ensure giveaways match your configured filters

### API Issues

- Check network connectivity
- Verify GamerPower API is accessible
- Clear extension storage and refresh data

## 📞 Support

If you encounter issues or have suggestions:

1. **🐛 Bug Reports**: [Create an issue](https://github.com/Neremyx/FreeDrop/issues) with:

   - Chrome version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console error messages (if any)

2. **💡 Feature Requests**: [Open an enhancement issue](https://github.com/Neremyx/FreeDrop/issues/new)

   - Use the "enhancement" label
   - Describe the feature and its benefits
   - Include mockups or examples if applicable

3. **❓ Questions**: Check existing issues or start a new discussion

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[GamerPower.com](https://www.gamerpower.com/)** - Providing the excellent free giveaway API that powers FreeDrop
- **[FontAwesome](https://fontawesome.com/)** - Beautiful icons used throughout the extension interface
- **Chrome Extension Community** - Documentation, examples, and best practices

## 📊 Project Status

- **Development**: ✅ Active
- **Distribution**: 📂 GitHub only (open source)
- **Issues**: [View open issues](https://github.com/Neremyx/FreeDrop/issues)
- **Latest Release**: [v1.0.0](https://github.com/Neremyx/FreeDrop/releases)

## 🔗 Links

- [GamerPower API Documentation](https://www.gamerpower.com/api) - The data source powering FreeDrop
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/) - Official Chrome extension development docs
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/) - Latest extension standards
- [FontAwesome Icons](https://fontawesome.com/icons) - Icon library used in the interface

---

**⚠️ Disclaimer**: FreeDrop is not affiliated with GamerPower.com. This is an independent project that uses their public API. All game and platform names are trademarks of their respective owners.

**🎮 Made with ❤️ for the gaming community - Available exclusively on GitHub**

---

### 🏗️ Development Notes

This extension was built with:

- **Manifest V3** for future compatibility
- **Vanilla JavaScript** (no external dependencies)
- **Modern CSS** with CSS Grid and Flexbox
- **Service Worker** architecture for background processing
- **Chrome Storage API** for settings persistence
- **Open Source** - Available exclusively on GitHub for the community
