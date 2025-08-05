(function() {
  'use strict';

  const WEBRING_API = 'https://raw.githubusercontent.com/open-making/site/main/data/webring.json';

  class WebringWidget {
    constructor(options = {}) {
      this.options = {
        theme: options.theme || 'light',
        style: options.style || 'compact',
        currentSite: options.currentSite || null,
        ...options
      };

      this.sites = [];
      this.currentIndex = -1;
      this.initialized = false;
    }

    async init() {
      if (this.initialized) return;

      try {
        await this.loadSites();
        this.findCurrentSite();
        this.render();
        this.initialized = true;
      } catch (error) {
        console.error('Webring widget failed to initialize:', error);
        this.renderError();
      }
    }

    async loadSites() {
      try {
        const response = await fetch(WEBRING_API);
        if (!response.ok) throw new Error('Failed to fetch sites');

        const data = await response.json();
        this.sites = data.sites.filter(site => site.active);
      } catch (error) {
        throw new Error(`Failed to load webring data: ${error.message}`);
      }
    }

    findCurrentSite() {
      const currentUrl = window.location.hostname;

      // Try to find current site by URL
      this.currentIndex = this.sites.findIndex(site => {
        const siteUrl = new URL(site.url);
        return siteUrl.hostname === currentUrl;
      });

      // If not found and currentSite option provided, try that
      if (this.currentIndex === -1 && this.options.currentSite) {
        const providedUrl = new URL(this.options.currentSite);
        this.currentIndex = this.sites.findIndex(site => {
          const siteUrl = new URL(site.url);
          return siteUrl.hostname === providedUrl.hostname;
        });
      }
    }

    getNextSite() {
      if (this.sites.length === 0) return null;
      if (this.currentIndex === -1) return this.sites[0];

      const nextIndex = (this.currentIndex + 1) % this.sites.length;
      return this.sites[nextIndex];
    }

    getPrevSite() {
      if (this.sites.length === 0) return null;
      if (this.currentIndex === -1) return this.sites[this.sites.length - 1];

      const prevIndex = this.currentIndex === 0 ? this.sites.length - 1 : this.currentIndex - 1;
      return this.sites[prevIndex];
    }

    getRandomSite() {
      if (this.sites.length === 0) return null;

      const availableSites = this.currentIndex !== -1
        ? this.sites.filter((_, index) => index !== this.currentIndex)
        : this.sites;

      if (availableSites.length === 0) return null;

      const randomIndex = Math.floor(Math.random() * availableSites.length);
      return availableSites[randomIndex];
    }

    render() {
      const container = document.getElementById('webring-widget');
      if (!container) {
        console.error('Webring widget container not found. Add <div id="webring-widget"></div> to your page.');
        return;
      }

      // Check if current site is part of the webring
      if (this.currentIndex === -1) {
        this.renderNotMember();
        return;
      }

      const nextSite = this.getNextSite();
      const prevSite = this.getPrevSite();
      const randomSite = this.getRandomSite();

      const theme = this.options.theme;
      const isCompact = this.options.style === 'compact';
      const isDark = theme === 'dark';

      if (isCompact) {
        // Compact version - terminal style inline
        container.innerHTML = `
          <div class="webring-compact">
            ${prevSite ? `<a href="${prevSite.url}" title="Previous: ${prevSite.title}">◂</a>` : ''}
            <a href="https://openmaking.club/webring" title="View all ${this.sites.length} sites" class="webring-home">
              OpenMaking WebRing
            </a>
            ${randomSite ? `<a href="${randomSite.url}" title="Random site">⤱</a>` : ''}
            ${nextSite ? `<a href="${nextSite.url}" title="Next: ${nextSite.title}">▸</a>` : ''}

            <style>
              .webring-compact {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                font-family: 'JetBrains Mono', 'SF Mono', 'Courier New', monospace;
                line-height: 1;
              }
              .webring-compact a {
                text-decoration: none;
                color: ${isDark ? '#4fc3f7' : '#1976d2'};
                padding: 2px 4px;
                transition: all 0.2s;
                border-bottom: 1px dotted ${isDark ? '#4fc3f7' : '#1976d2'};
              }
              .webring-compact a:hover {
                color: ${isDark ? '#81d4fa' : '#0d47a1'};
                border-bottom: 1px solid ${isDark ? '#81d4fa' : '#0d47a1'};
              }
              .webring-compact .webring-home {
                font-size: 11px;
                letter-spacing: 1px;
                text-transform: uppercase;
              }
            </style>
          </div>
        `;
      } else {
        // Full version - terminal themed box
        container.innerHTML = `
          <div class="webring-full">
            <div class="webring-header">
              <a href="https://openmaking.club/webring" title="View all sites" class="webring-title">
                OpenMaking WebRing
              </a>
              <span class="webring-count">${this.sites.length}</span>
            </div>

            <div class="webring-nav">
              ${prevSite ? `<a href="${prevSite.url}" title="Previous: ${prevSite.title}">◂ prev</a>` : ''}
              ${randomSite ? `<a href="${randomSite.url}" title="Random site">⤱ random</a>` : ''}
              ${nextSite ? `<a href="${nextSite.url}" title="Next: ${nextSite.title}">next ▸</a>` : ''}
            </div>

            ${this.currentIndex !== -1 ? `
              <div class="webring-current">
                ▸ ${this.sites[this.currentIndex].title}
              </div>
            ` : ''}

            <style>
              .webring-full {
                border: 1px solid ${isDark ? '#333' : '#ccc'};
                background: ${isDark ? '#1a1a2e' : '#f8f9fa'};
                color: ${isDark ? '#eee' : '#333'};
                padding: 12px;
                font-family: 'JetBrains Mono', 'SF Mono', 'Courier New', monospace;
                font-size: 12px;
                text-align: center;
                max-width: 280px;
                margin: 16px 0;
              }
              .webring-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
              }
              .webring-title {
                text-decoration: none;
                color: ${isDark ? '#ffc107' : '#f57c00'};
                font-weight: bold;
                letter-spacing: 1px;
                font-size: 13px;
                text-transform: uppercase;
                text-align: center;
                transition: opacity 0.2s;
              }
              .webring-title:hover {
                opacity: 0.7;
              }
              .webring-count {
                color: ${isDark ? '#4fc3f7' : '#1976d2'};
                font-size: 11px;
              }
              .webring-nav {
                display: flex;
                gap: 8px;
                justify-content: center;
                margin-bottom: 10px;
                flex-wrap: wrap;
              }
              .webring-nav a {
                text-decoration: none;
                color: ${isDark ? '#4fc3f7' : '#1976d2'};
                padding: 4px 8px;
                font-size: 11px;
                transition: all 0.2s;
                border-bottom: 1px dotted ${isDark ? '#4fc3f7' : '#1976d2'};
                white-space: nowrap;
              }
              .webring-nav a:hover {
                color: ${isDark ? '#81d4fa' : '#0d47a1'};
                border-bottom: 1px solid ${isDark ? '#81d4fa' : '#0d47a1'};
              }
              .webring-current {
                font-size: 10px;
                opacity: 0.8;
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid ${isDark ? '#333' : '#ddd'};
                color: ${isDark ? '#ff6b6b' : '#d32f2f'};
              }
            </style>
          </div>
        `;
      }
    }

    renderNotMember() {
      const container = document.getElementById('webring-widget');
      if (!container) return;

      const isDark = this.options.theme === 'dark';
      const isCompact = this.options.style === 'compact';

      if (isCompact) {
        container.innerHTML = `
          <div style="
            font-family: 'JetBrains Mono', 'SF Mono', 'Courier New', monospace;
            font-size: 11px;
            color: ${isDark ? '#ff6b6b' : '#d32f2f'};
            display: inline-flex;
            align-items: center;
            gap: 4px;
          ">
            <a href="https://openmaking.club/webring" style="
              color: ${isDark ? '#4fc3f7' : '#1976d2'};
              text-decoration: none;
              border-bottom: 1px dotted ${isDark ? '#4fc3f7' : '#1976d2'};
            ">join openmaking webring</a>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div style="
            border: 1px solid ${isDark ? '#333' : '#ccc'};
            background: ${isDark ? '#1a1a2e' : '#f8f9fa'};
            color: ${isDark ? '#eee' : '#333'};
            padding: 12px;
            font-family: 'JetBrains Mono', 'SF Mono', 'Courier New', monospace;
            font-size: 12px;
            text-align: center;
            max-width: 280px;
            margin: 16px 0;
          ">
            <div style="
              color: ${isDark ? '#ff6b6b' : '#d32f2f'};
              margin-bottom: 8px;
              font-size: 10px;
            ">
              ⚠ not a webring member
            </div>
            <a href="https://openmaking.club/webring" style="
              color: ${isDark ? '#4fc3f7' : '#1976d2'};
              text-decoration: none;
              border-bottom: 1px dotted ${isDark ? '#4fc3f7' : '#1976d2'};
              font-size: 11px;
            ">join the openmaking webring</a>
          </div>
        `;
      }
    }

    renderError() {
      const container = document.getElementById('webring-widget');
      if (!container) return;

      container.innerHTML = `
        <div style="
          font-family: 'JetBrains Mono', 'SF Mono', 'Courier New', monospace;
          font-size: 11px;
          color: #666;
          text-align: center;
          padding: 8px;
          border: 1px solid #ddd;
        ">
          webring unavailable
        </div>
      `;
    }
  }

  // Auto-initialize if options are provided via data attributes
  function autoInit() {
    const container = document.getElementById('webring-widget');
    if (!container) return;

    const options = {
      theme: container.dataset.theme || 'light',
      style: container.dataset.style || 'compact',
      currentSite: container.dataset.currentSite || null
    };

    const widget = new WebringWidget(options);
    widget.init();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // Export for manual initialization
  window.WebringWidget = WebringWidget;
})();