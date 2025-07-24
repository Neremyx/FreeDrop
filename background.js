// Background service worker for FreeDrop extension
class FreeDrop {
  constructor() {
    this.API_BASE = 'https://www.gamerpower.com/api'
    this.CACHE_KEY = 'freedrop_cache'
    this.SETTINGS_KEY = 'freedrop_settings'
    this.LAST_FETCH_KEY = 'freedrop_last_fetch'
    this.ALARM_NAME = 'freedrop_refresh'
    this.REFRESH_INTERVAL = 5 // minutes
    this.RATE_LIMIT_DELAY = 250 // ms (4 requests per second max)

    this.init()
  }

  async init() {
    // Set up alarm for periodic refresh
    chrome.alarms.create(this.ALARM_NAME, { periodInMinutes: this.REFRESH_INTERVAL })

    // Check if this is first install
    const settings = await this.getSettings()
    if (!settings.configured) {
      chrome.tabs.create({ url: chrome.runtime.getURL('config.html') })
    }

    // Initial fetch
    this.fetchAndProcessGiveaways()
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

  async setCachedData(data) {
    await chrome.storage.local.set({
      [this.CACHE_KEY]: data,
      [this.LAST_FETCH_KEY]: Date.now(),
    })
  }

  async fetchGiveaways(platforms = [], types = []) {
    try {
      let url = `${this.API_BASE}/giveaways`

      // If filtering by both platforms and types, use the filter endpoint
      if (platforms.length > 0 && types.length > 0) {
        url = `${this.API_BASE}/filter`
        const params = new URLSearchParams()
        params.append('platform', platforms.join('.'))
        params.append('type', types.join('.'))
        url += `?${params.toString()}`
      }
      // If only platforms are specified
      else if (platforms.length > 0) {
        const params = new URLSearchParams()
        params.append('platform', platforms.join('.'))
        url += `?${params.toString()}`
      }
      // If only types are specified
      else if (types.length > 0) {
        const params = new URLSearchParams()
        params.append('type', types.join('.'))
        url += `?${params.toString()}`
      }

      console.log('Fetching from:', url)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching giveaways:', error)
      return []
    }
  }

  async fetchAndProcessGiveaways() {
    const settings = await this.getSettings()

    if (!settings.configured) {
      console.log('Extension not configured yet')
      return
    }

    const { data: cachedData, lastFetch } = await this.getCachedData()
    const now = Date.now()
    const fiveMinutesAgo = now - this.REFRESH_INTERVAL * 60 * 1000

    // Only fetch if cache is older than 5 minutes
    if (lastFetch > fiveMinutesAgo && cachedData.length > 0) {
      console.log('Using cached data')
      return cachedData
    }

    console.log('Fetching fresh data')
    const newData = await this.fetchGiveaways(settings.platforms, settings.types)

    if (newData.length > 0) {
      // Check for new giveaways
      if (settings.notifications && cachedData.length > 0) {
        const newGiveaways = this.findNewGiveaways(cachedData, newData)
        if (newGiveaways.length > 0) {
          this.showNotifications(newGiveaways)
        }
      }

      await this.setCachedData(newData)
    }

    return newData
  }

  findNewGiveaways(oldData, newData) {
    const oldIds = new Set(oldData.map(item => item.id))
    return newData.filter(item => !oldIds.has(item.id))
  }

  async showNotifications(newGiveaways) {
    for (const giveaway of newGiveaways.slice(0, 3)) {
      // Limit to 3 notifications
      const notificationId = `freedrop_${giveaway.id}`

      await chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'New Free Game Available!',
        message: `${giveaway.title} - ${giveaway.worth || 'FREE'}`,
        contextMessage: `Platform: ${giveaway.platforms}`,
        buttons: [{ title: 'View Details' }, { title: 'Dismiss' }],
      })

      // Auto-clear notification after 10 seconds
      setTimeout(() => {
        chrome.notifications.clear(notificationId)
      }, 10000)
    }
  }

  formatPrice(price) {
    if (!price || price === 'N/A' || price === '$0.00') {
      return 'FREE'
    }
    return price
  }
}

// Event listeners
chrome.runtime.onInstalled.addListener(() => {
  console.log('FreeDrop extension installed')
  new FreeDrop()
})

chrome.runtime.onStartup.addListener(() => {
  console.log('FreeDrop extension started')
  new FreeDrop()
})

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'freedrop_refresh') {
    console.log('Alarm triggered: refreshing giveaways')
    const freeDrop = new FreeDrop()
    freeDrop.fetchAndProcessGiveaways()
  }
})

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId.startsWith('freedrop_')) {
    if (buttonIndex === 0) {
      // View Details button clicked
      chrome.action.openPopup()
    }
    chrome.notifications.clear(notificationId)
  }
})

chrome.notifications.onClicked.addListener(notificationId => {
  if (notificationId.startsWith('freedrop_')) {
    chrome.action.openPopup()
    chrome.notifications.clear(notificationId)
  }
})

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'forceRefresh') {
    console.log('Force refresh requested from popup')
    const freeDrop = new FreeDrop()
    freeDrop
      .fetchAndProcessGiveaways()
      .then(() => {
        sendResponse({ success: true })
      })
      .catch(error => {
        console.error('Error during force refresh:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Indicates we will send a response asynchronously
  }
})

// Initialize when service worker starts
const freeDrop = new FreeDrop()
