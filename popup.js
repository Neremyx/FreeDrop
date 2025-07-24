// Popup functionality for FreeDrop extension
class PopupManager {
  constructor() {
    this.CACHE_KEY = 'freedrop_cache'
    this.SETTINGS_KEY = 'freedrop_settings'
    this.LAST_FETCH_KEY = 'freedrop_last_fetch'
    this.timeUpdateInterval = null

    this.elements = {
      loading: document.getElementById('loading'),
      errorMessage: document.getElementById('error-message'),
      giveawaysContainer: document.getElementById('giveaways-container'),
      noGiveaways: document.getElementById('no-giveaways'),
      lastUpdated: document.getElementById('last-updated'),
      settingsBtn: document.getElementById('settings-btn'),
      configureBtn: document.getElementById('configure-btn'),
      refreshBtn: document.getElementById('refresh-btn'),
    }

    this.init()
  }

  async init() {
    this.setupEventListeners()
    await this.loadAndDisplayGiveaways()
    this.startTimeUpdateInterval()
  }

  startTimeUpdateInterval() {
    // Update counter every minute
    this.timeUpdateInterval = setInterval(async () => {
      const { lastFetch } = await this.getCachedData()
      if (lastFetch) {
        this.updateLastUpdatedTime(lastFetch)
      }
    }, 60000) // 60 seconds
  }

  // Clean up interval when needed
  cleanup() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
    }
  }

  setupEventListeners() {
    this.elements.settingsBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('config.html') })
    })

    this.elements.configureBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('config.html') })
    })

    this.elements.refreshBtn.addEventListener('click', () => {
      this.forceRefresh()
    })
  }

  async getSettings() {
    const result = await chrome.storage.local.get(this.SETTINGS_KEY)
    return (
      result[this.SETTINGS_KEY] || {
        configured: false,
        platforms: [],
        types: [],
        notifications: true,
      }
    )
  }

  async getCachedData() {
    const result = await chrome.storage.local.get([this.CACHE_KEY, this.LAST_FETCH_KEY])
    return {
      data: result[this.CACHE_KEY] || [],
      lastFetch: result[this.LAST_FETCH_KEY] || 0,
    }
  }

  async loadAndDisplayGiveaways() {
    this.showLoading()

    try {
      const settings = await this.getSettings()

      if (!settings.configured) {
        this.showError()
        return
      }

      const { data, lastFetch } = await this.getCachedData()

      if (data.length === 0) {
        this.showNoGiveaways()
      } else {
        this.displayGiveaways(data)
        this.updateLastUpdatedTime(lastFetch)
      }
    } catch (error) {
      console.error('Error loading giveaways:', error)
      this.showNoGiveaways()
    }
  }

  async forceRefresh() {
    this.elements.refreshBtn.classList.add('spinning')

    // Clear cache to force fresh data
    await chrome.storage.local.remove(['freedrop_cache', 'freedrop_last_fetch'])

    // Send message to background script to force refresh
    try {
      const response = await chrome.runtime.sendMessage({ action: 'forceRefresh' })
      setTimeout(() => {
        this.loadAndDisplayGiveaways()
        this.elements.refreshBtn.classList.remove('spinning')
      }, 1000)
    } catch (error) {
      console.error('Error forcing refresh:', error)
      this.elements.refreshBtn.classList.remove('spinning')
    }
  }

  showLoading() {
    this.hideAllSections()
    this.elements.loading.style.display = 'flex'
  }

  showError() {
    this.hideAllSections()
    this.elements.errorMessage.style.display = 'flex'
  }

  showNoGiveaways() {
    this.hideAllSections()
    this.elements.noGiveaways.style.display = 'flex'
  }

  hideAllSections() {
    this.elements.loading.style.display = 'none'
    this.elements.errorMessage.style.display = 'none'
    this.elements.giveawaysContainer.style.display = 'none'
    this.elements.noGiveaways.style.display = 'none'
  }

  displayGiveaways(giveaways) {
    this.hideAllSections()
    this.elements.giveawaysContainer.style.display = 'block'
    this.elements.giveawaysContainer.innerHTML = ''

    giveaways.forEach(giveaway => {
      const giveawayElement = this.createGiveawayElement(giveaway)
      this.elements.giveawaysContainer.appendChild(giveawayElement)
    })
  }

  createGiveawayElement(giveaway) {
    const element = document.createElement('div')
    element.className = 'giveaway-item'

    const thumbnail = giveaway.thumbnail || giveaway.image || ''
    const originalPrice = this.formatOriginalPrice(giveaway.worth)
    const platforms = this.formatPlatforms(giveaway.platforms)
    const type = this.formatType(giveaway.type)

    // Get the URL to open
    const giveawayUrl = giveaway.gamerpower_url || giveaway.open_giveaway_url

    element.innerHTML = `
      <div class="giveaway-content">
        <div class="giveaway-image">
          ${thumbnail ? `<img src="${thumbnail}" alt="${giveaway.title}">` : ''}
          <div class="giveaway-type">
            <i class="fas ${this.getTypeIcon(giveaway.type)}"></i>
            <span>${type}</span>
          </div>
        </div>
        <div class="giveaway-info">
          <h3 class="giveaway-title">${giveaway.title}</h3>
          <div class="giveaway-details">
            <div class="giveaway-price">
              ${originalPrice ? `<span class="original-price">${originalPrice}</span>` : ''}
              <span class="free-price">FREE</span>
            </div>
            <div class="giveaway-platforms">
              <i class="fas fa-desktop"></i>
              <span>${platforms}</span>
            </div>
          </div>
          <div class="giveaway-description">
            ${giveaway.description ? this.truncateText(giveaway.description, 100) : ''}
          </div>
        </div>
        <div class="giveaway-action">
          <i class="fas fa-external-link-alt"></i>
        </div>
      </div>
    `

    // Add click event listener to open the URL
    const giveawayContent = element.querySelector('.giveaway-content')
    giveawayContent.style.cursor = 'pointer'
    giveawayContent.addEventListener('click', () => {
      if (giveawayUrl) {
        console.log('Opening URL:', giveawayUrl)
        chrome.tabs.create({ url: giveawayUrl })
      } else {
        console.error('No URL found for giveaway:', giveaway)
      }
    })

    // Add error handling for images
    const img = element.querySelector('img')
    if (img) {
      img.addEventListener('error', () => {
        img.style.display = 'none'
      })
    }

    return element
  }

  formatOriginalPrice(worth) {
    if (!worth || worth === 'N/A' || worth === '$0.00') {
      return null
    }
    return worth
  }

  formatPlatforms(platforms) {
    if (!platforms) return 'Unknown'

    // Convert platform names to more readable format
    const platformMap = {
      pc: 'PC',
      steam: 'Steam',
      'epic-games-store': 'Epic Games',
      gog: 'GOG',
      ubisoft: 'Ubisoft',
      origin: 'Origin',
      battlenet: 'Battle.net',
      ps4: 'PlayStation 4',
      ps5: 'PlayStation 5',
      'xbox-one': 'Xbox One',
      'xbox-series-xs': 'Xbox Series X|S',
      switch: 'Nintendo Switch',
      android: 'Android',
      ios: 'iOS',
      vr: 'VR',
    }

    return platforms
      .split(', ')
      .map(platform => platformMap[platform.toLowerCase()] || platform)
      .join(', ')
  }

  formatType(type) {
    const typeMap = {
      game: 'Game',
      loot: 'Loot',
      beta: 'Beta',
    }
    return typeMap[type] || type
  }

  getTypeIcon(type) {
    const iconMap = {
      game: 'fa-gamepad',
      loot: 'fa-gem',
      beta: 'fa-flask',
    }
    return iconMap[type] || 'fa-gift'
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  updateLastUpdatedTime(timestamp) {
    if (!timestamp) {
      this.elements.lastUpdated.querySelector('span').textContent = 'Last updated: Never'
      return
    }

    const now = new Date()
    const lastUpdate = new Date(timestamp)
    const diffMs = now - lastUpdate
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)

    let timeText
    if (diffMinutes < 1) {
      timeText = 'Just now'
    } else if (diffMinutes <= 10) {
      // 1-10 minutes: count one by one
      timeText = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    } else if (diffMinutes < 60) {
      // 10-60 minutes: count by 5s
      const roundedMinutes = Math.floor(diffMinutes / 5) * 5
      timeText = `${roundedMinutes} minutes ago`
    } else if (diffHours < 24) {
      // 1-24 hours: count in hours
      timeText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      // 1-7 days: count in days
      timeText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffWeeks < 4) {
      // 1-4 weeks: count in weeks
      timeText = `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
    } else {
      // More than 4 weeks: count in months
      timeText = `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
    }

    this.elements.lastUpdated.querySelector('span').textContent = `Last updated: ${timeText}`
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager()
})
