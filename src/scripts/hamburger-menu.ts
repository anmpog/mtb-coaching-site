// Source: Andy Bell
// https://piccalil.li/blog/build-a-fully-responsive-progressively-enhanced-burger-menu/
// Adapted for my specific use case.

import getFocusableElements from './get-focusable-elements.js'

class BurgerMenu extends HTMLElement {
  #controller = new AbortController()

  _debug() {
    this.#controller.abort()
  }

  constructor() {
    super()

    this.state = new Proxy(
      {
        status: 'closed',
        enabled: false,
      },
      {
        set: (state, key, value) => {
          const oldValue = state[key]

          state[key] = value

          // Try/Catch?
          if (oldValue !== value) {
            this.processStateChange()
          }

          return true
        },
      },
    )
  }

  get breakpoint() {
    return parseInt(this.getAttribute('data-breakpoint') || 9999, 10)
  }

  connectedCallback() {
    this.initialMarkup = this.innerHTML
    // js-enabled class is used for children to adapt enhanced presentation
    this.classList.add('js-enabled')

    // Media query listener to work in concert with CSS media queries
    this.mediaQueryListener = window.matchMedia(
      `(max-width: ${this.breakpoint}px)`,
    )
    this.render()

    const updateEnabledState = () => {
      // If viewport width does not fulfill media query and menu is open,
      // close menu
      if (this.state.enabled && this.state.status === 'open') {
        this.state.status = 'closed'
      }
      this.state.enabled = this.mediaQueryListener.matches
    }

    // setting initial enabled state based on media query constraints
    updateEnabledState()

    // Listen for media query changes that would disable menu
    this.mediaQueryListener.addEventListener('change', updateEnabledState, {
      signal: this.#controller.signal,
    })
  }

  disconnectedCallback() {
    this.classList.remove('js-enabled')
    this.#controller.abort()
  }

  render() {
    this.innerHTML = `
      <div class="burger-menu" data-element="burger-root">
        <button class="burger-menu__trigger" data-element="burger-menu-trigger" type="button" aria-label="Open menu">
          <span class="burger-menu__bar" aria-hidden="true"></span>
        </button>
        <div class="burger-menu__panel" data-element="burger-menu-panel">
          ${this.initialMarkup} 
        </div>
      </div>
    `

    this.postRender()
  }

  toggle() {
    this.state.status = this.state.status === 'closed' ? 'open' : 'closed'
  }

  postRender() {
    this.trigger = this.querySelector('[data-element="burger-menu-trigger"]')
    this.panel = this.querySelector('[data-element="burger-menu-panel"]')
    this.root = this.querySelector('[data-element="burger-root"]')
    this.focusableElements = getFocusableElements(this)

    if (this.trigger && this.panel) {
      this.trigger.addEventListener(
        'click',
        (event) => {
          event.preventDefault()
          this.toggle()
        },
        {
          signal: this.#controller.signal,
        },
      )

      document.addEventListener(
        'focusin',
        () => {
          if (
            !this.contains(document.activeElement) &&
            this.state.status === 'open'
          ) {
            this.toggle()
          }
        },
        { signal: this.#controller.signal },
      )

      return
    }

    this.innerHTML = this.initialMarkup
  }

  processStateChange() {
    this.root.setAttribute('status', this.state.status)
    this.root.setAttribute('enabled', this.state.enabled ? 'true' : 'false')

    this.manageFocus()

    switch (this.state.status) {
      case 'closed':
        this.trigger.setAttribute('aria-expanded', 'false')
        this.trigger.setAttribute('aria-label', 'Open menu')
        break
      case 'open':
        this.trigger.setAttribute('aria-expanded', 'true')
        this.trigger.setAttribute('aria-label', 'Close menu')
        break
    }
  }

  manageFocus() {
    const focusableElements = [...this.focusableElements]
    // If NOT ENABLED, remove tabindex
    if (!this.state.enabled) {
      this.focusableElements.forEach((element) =>
        element.removeAttribute('tabindex'),
      )
      return
    }

    // Switch cases open/closed
    switch (this.state.status) {
      case 'open':
        focusableElements.forEach((element) =>
          element.removeAttribute('tabindex'),
        )
        break
      case 'closed':
        focusableElements
          .filter(
            (element) =>
              element.getAttribute('data-element') !== 'burger-menu-trigger',
          )
          .forEach((element) => element.setAttribute('tabindex', '-1'))
        break
    }
  }
}

if ('customElements' in window) {
  customElements.define('burger-menu', BurgerMenu)
}

export default BurgerMenu
