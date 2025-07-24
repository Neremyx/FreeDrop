// Configuration page functionality for FreeDrop extension
class ConfigManager {
  constructor() {
    this.SETTINGS_KEY = 'freedrop_settings'

    this.platforms = [
      { id: 'pc', name: 'PC', icon: 'fa-desktop' },
      { id: 'steam', name: 'Steam', icon: 'fa-steam' },
      { id: 'epic-games-store', name: 'Epic Games Store', icon: 'epic-games', isCustom: true },
      { id: 'gog', name: 'GOG', icon: 'gog', isCustom: true },
      { id: 'ubisoft', name: 'Ubisoft Connect', icon: 'ubisoft', isCustom: true },
      { id: 'origin', name: 'EA Origin', icon: 'ea-origin', isCustom: true },
      { id: 'battlenet', name: 'Battle.net', icon: 'fa-battle-net' },
      { id: 'ps4', name: 'PlayStation 4', icon: 'fa-playstation' },
      { id: 'ps5', name: 'PlayStation 5', icon: 'fa-playstation' },
      { id: 'xbox-one', name: 'Xbox One', icon: 'fa-xbox' },
      { id: 'xbox-series-xs', name: 'Xbox Series X|S', icon: 'fa-xbox' },
      { id: 'switch', name: 'Nintendo Switch', icon: 'nintendo-switch', isCustom: true },
      { id: 'android', name: 'Android', icon: 'fa-android' },
      { id: 'ios', name: 'iOS', icon: 'fa-apple' },
      { id: 'vr', name: 'VR', icon: 'vr-headset', isCustom: true },
      { id: 'itchio', name: 'itch.io', icon: 'fa-itch-io' },
      { id: 'drm-free', name: 'DRM Free', icon: 'drm-free', isCustom: true },
    ]

    this.types = [
      {
        id: 'game',
        name: 'Full Games',
        icon: 'fa-gamepad',
        description: 'Complete games that are free to keep',
      },
      {
        id: 'loot',
        name: 'In-Game Loot',
        icon: 'fa-gem',
        description: 'Skins, items, and in-game content',
      },
      {
        id: 'beta',
        name: 'Beta Access',
        icon: 'fa-flask',
        description: 'Early access to upcoming games',
      },
    ]

    this.elements = {
      welcomeSection: document.getElementById('welcome-section'),
      settingsForm: document.getElementById('settings-form'),
      platformsGrid: document.getElementById('platforms-grid'),
      typesGrid: document.getElementById('types-grid'),
      notificationsEnabled: document.getElementById('notifications-enabled'),
      saveBtn: document.getElementById('save-btn'),
      successMessage: document.getElementById('success-message'),
    }

    this.init()
  }

  async init() {
    this.setupEventListeners()
    this.renderPlatforms()
    this.renderTypes()
    await this.loadSettings()
    await this.checkFirstTime()
  }

  async checkFirstTime() {
    const settings = await this.getSettings()
    if (!settings.configured) {
      this.elements.welcomeSection.style.display = 'block'
    }
  }

  setupEventListeners() {
    this.elements.settingsForm.addEventListener('submit', e => {
      e.preventDefault()
      this.saveSettings()
    })

    // Ensure at least one type is selected
    this.elements.typesGrid.addEventListener('change', () => {
      const checkedTypes = this.elements.typesGrid.querySelectorAll(
        'input[type="checkbox"]:checked'
      )
      if (checkedTypes.length === 0) {
        // Re-check the game type if none are selected
        const gameCheckbox = this.elements.typesGrid.querySelector('input[value="game"]')
        if (gameCheckbox) {
          gameCheckbox.checked = true
        }
      }
    })
  }

  renderPlatforms() {
    this.elements.platformsGrid.innerHTML = ''

    this.platforms.forEach(platform => {
      const label = document.createElement('label')
      label.className = 'checkbox-item'

      // Handle custom icons vs FontAwesome icons
      let iconHtml
      if (platform.isCustom) {
        iconHtml = `<img src="icons/${platform.icon}.png" alt="${platform.name}" class="custom-icon">`
      } else {
        // Determine if it's a brand icon or regular icon
        const iconClass = [
          'fa-steam',
          'fa-battle-net',
          'fa-playstation',
          'fa-xbox',
          'fa-android',
          'fa-apple',
          'fa-itch-io',
        ].includes(platform.icon)
          ? 'fa-brands'
          : 'fas'
        iconHtml = `<i class="${iconClass} ${platform.icon}"></i>`
      }

      label.innerHTML = `
        <input type="checkbox" name="platforms" value="${platform.id}">
        <div class="checkbox-content">
          ${iconHtml}
          <span>${platform.name}</span>
        </div>
      `
      this.elements.platformsGrid.appendChild(label)
    })
  }

  renderTypes() {
    this.elements.typesGrid.innerHTML = ''

    this.types.forEach(type => {
      const label = document.createElement('label')
      label.className = 'checkbox-item type-item'
      label.innerHTML = `
        <input type="checkbox" name="types" value="${type.id}">
        <div class="checkbox-content">
          <i class="fas ${type.icon}"></i>
          <div class="type-info">
            <span class="type-name">${type.name}</span>
            <span class="type-description">${type.description}</span>
          </div>
        </div>
      `
      this.elements.typesGrid.appendChild(label)
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

  async loadSettings() {
    const settings = await this.getSettings()

    // Load platform preferences
    settings.platforms.forEach(platformId => {
      const checkbox = this.elements.platformsGrid.querySelector(`input[value="${platformId}"]`)
      if (checkbox) {
        checkbox.checked = true
      }
    })

    // Load type preferences
    settings.types.forEach(typeId => {
      const checkbox = this.elements.typesGrid.querySelector(`input[value="${typeId}"]`)
      if (checkbox) {
        checkbox.checked = true
      }
    })

    // Load notification preference
    this.elements.notificationsEnabled.checked = settings.notifications

    // If no settings are configured, set defaults
    if (!settings.configured) {
      this.setDefaults()
    }
  }

  setDefaults() {
    // Default: only full games and notifications enabled (no platforms pre-selected)
    const gameCheckbox = this.elements.typesGrid.querySelector('input[value="game"]')
    if (gameCheckbox) {
      gameCheckbox.checked = true
    }
  }

  async saveSettings() {
    // Disable save button during save
    this.elements.saveBtn.disabled = true
    this.elements.saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'

    // Get selected platforms
    const platforms = Array.from(
      this.elements.platformsGrid.querySelectorAll('input[type="checkbox"]:checked')
    ).map(cb => cb.value)

    // Get selected types
    const types = Array.from(
      this.elements.typesGrid.querySelectorAll('input[type="checkbox"]:checked')
    ).map(cb => cb.value)

    // Validate selections
    if (platforms.length === 0) {
      alert('Please select at least one platform.')
      this.resetSaveButton()
      return
    }

    if (types.length === 0) {
      alert('Please select at least one giveaway type.')
      this.resetSaveButton()
      return
    }

    // Get notification preference
    const notifications = this.elements.notificationsEnabled.checked

    // Save settings
    const settings = {
      configured: true,
      platforms,
      types,
      notifications,
    }

    try {
      await chrome.storage.local.set({ [this.SETTINGS_KEY]: settings })

      // Clear cache to force refresh with new settings
      await chrome.storage.local.remove(['freedrop_cache', 'freedrop_last_fetch'])

      // Send message to background script to refresh data immediately
      try {
        await chrome.runtime.sendMessage({ action: 'forceRefresh' })
      } catch (error) {
        console.log('Background script not ready, data will refresh on next popup open')
      }

      this.showSuccessMessage()
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    }

    this.resetSaveButton()
  }

  resetSaveButton() {
    this.elements.saveBtn.disabled = false
    this.elements.saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Settings'
  }

  showSuccessMessage() {
    this.elements.settingsForm.style.display = 'none'
    this.elements.welcomeSection.style.display = 'none'
    this.elements.successMessage.style.display = 'flex'

    // Auto-hide success message after 3 seconds and show form again
    setTimeout(() => {
      this.elements.successMessage.style.display = 'none'
      this.elements.settingsForm.style.display = 'block'
    }, 3000)
  }
}

// Initialize configuration manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ConfigManager()
})
