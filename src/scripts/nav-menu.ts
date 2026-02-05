const navMenuButton = document.getElementById('menu-button')
const navMenuBackdrop = document.getElementById('menu-backdrop')
const navMenuWrapper = document.getElementById('menu-wrapper')
const mainNav = document.getElementById('main-nav')

function openMenu() {
  navMenuButton?.setAttribute('aria-expanded', 'true')
  navMenuWrapper?.classList.add('expanded')
  navMenuBackdrop?.classList.add('blur')

  window.addEventListener('keydown', detectEscKeyPress)
  window.addEventListener('click', detectClickOutsideMenu)
}

function closeMenu() {
  navMenuButton?.setAttribute('aria-expanded', 'false')
  navMenuWrapper?.classList.remove('expanded')
  navMenuBackdrop?.classList.remove('blur')

  window.removeEventListener('keydown', detectEscKeyPress)
  window.removeEventListener('click', detectClickOutsideMenu)
}

function detectClickOutsideMenu(event) {
  if (
    !navMenuWrapper?.contains(event.target) &&
    !navMenuButton?.contains(event.target)
  ) {
    closeMenu()
  }
}

function detectEscKeyPress(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

navMenuButton?.addEventListener('click', (event) => {
  // console.log('nav menu button click')
  event?.stopPropagation()
  if (navMenuButton?.getAttribute('aria-expanded') === 'false') {
    openMenu()
  } else if (navMenuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu()
  }
})

window.addEventListener('keydown', (event) => {
  detectEscKeyPress(event)
})
