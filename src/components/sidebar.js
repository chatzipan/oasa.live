const ESC_KEY = 27
const HIDDEN_CLASS = 'sidebar--hidden'
const TOP_BAR_WITH_MENU = 'top-bar--with-menu'

const title = 'HVV Live Map'
const menuTitle = 'Menu'

/**
 * The sidebar UI element containing journey statistics and filters.
 */
export default class Sidebar {
  constructor() {
    this.element = document.querySelector('.sidebar')
    this.openButton = document.querySelector('.open-button')
    this.openButtonIcon = this.openButton.querySelector('i')
    this.topBar = document.querySelector('.top-bar')
    this.heading = this.topBar.querySelector('.heading')

    this.desktopCloseButton = this.element.querySelector(
      '.sidebar-close-button'
    )
    this.desktopOpenButton = document.querySelector('.sidebar-open-button')

    this.isHiddenMobile = true
    this.isHiddenDesktop = true

    this.initEventHandlers()
  }

  /**
   * Initiailizes the event handler on the toggle button.
   */
  initEventHandlers() {
    this.openButton.addEventListener(
      'click',
      this.toggleMobileSidebar.bind(this)
    )
    this.desktopCloseButton.addEventListener(
      'click',
      this.toggleDesktopSidebar.bind(this)
    )
    this.desktopOpenButton.addEventListener(
      'click',
      this.toggleDesktopSidebar.bind(this)
    )
    window.addEventListener('keydown', event => {
      if (event.keyCode === ESC_KEY && !this.isHiddenDesktop) {
        this.toggleDesktopSidebar()
      }
    })
  }

  /**
   * Event handler for the desktop sidebar open and close buttons.
   */
  toggleDesktopSidebar() {
    if (this.isHiddenDesktop) {
      this.element.classList.remove(HIDDEN_CLASS)
    } else {
      this.element.classList.add(HIDDEN_CLASS)
    }

    this.isHiddenDesktop = !this.isHiddenDesktop
  }

  /**
   * Event handler for the open and close buttons.
   */
  toggleMobileSidebar() {
    if (this.isHiddenMobile) {
      this.element.classList.remove(HIDDEN_CLASS)
      this.topBar.classList.add(TOP_BAR_WITH_MENU)
      this.heading.textContent = menuTitle
      this.openButtonIcon.textContent = 'close'
    } else {
      this.element.classList.add(HIDDEN_CLASS)
      this.topBar.classList.remove(TOP_BAR_WITH_MENU)
      this.heading.textContent = title
      this.openButtonIcon.textContent = 'more_vert'
    }

    this.isHiddenMobile = !this.isHiddenMobile
  }
}
