const navMenuButton = document.getElementById(
  'nav-menu-button',
) as HTMLButtonElement

const navMenuWrapper = document.getElementById('menu-wrapper') as HTMLDivElement
const mainContent = document.getElementById('main-content') as HTMLElement
const footer = document.getElementById('footer') as HTMLElement

// Adding a class to the body so that it's easier to write CSS based on
// presence of JavaScript

document.body.classList.add('js-enabled')

function openMenu() {
  navMenuButton.setAttribute('aria-expanded', 'true')
  document.body.classList.add('block-scroll')
  mainContent.inert = true
  footer.inert = true

  window.addEventListener('click', detectClickOutsideMenu)
}

function closeMenu() {
  navMenuButton.setAttribute('aria-expanded', 'false')
  document.body.classList.remove('block-scroll')
  mainContent.inert = false
  footer.inert = false

  window.removeEventListener('click', detectClickOutsideMenu)
}

function detectClickOutsideMenu(event: MouseEvent) {
  const target = event.target as Node
  if (!navMenuWrapper.contains(target) && !navMenuButton.contains(target)) {
    closeMenu()
  }
}

function detectEscKeyPress(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

navMenuButton.addEventListener('click', (event) => {
  event.stopPropagation()
  if (navMenuButton.getAttribute('aria-expanded') === 'false') {
    openMenu()
  } else if (navMenuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu()
  }
})

window.addEventListener('keydown', (event) => {
  detectEscKeyPress(event)
})
