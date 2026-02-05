const navMenuButton = document.getElementById(
  'menu-button',
) as HTMLButtonElement
const navMenuBackdrop = document.getElementById(
  'menu-backdrop',
) as HTMLDivElement
const navMenuWrapper = document.getElementById('menu-wrapper') as HTMLDivElement

function openMenu() {
  navMenuButton.setAttribute('aria-expanded', 'true')
  navMenuWrapper.classList.add('expanded')
  navMenuBackdrop.classList.add('blur')
  document.body.classList.add('block-scroll')

  window.addEventListener('keydown', detectEscKeyPress)
  window.addEventListener('click', detectClickOutsideMenu)
}

function closeMenu() {
  navMenuButton.setAttribute('aria-expanded', 'false')
  navMenuWrapper.classList.remove('expanded')
  navMenuBackdrop.classList.remove('blur')
  document.body.classList.remove('block-scroll')

  window.removeEventListener('keydown', detectEscKeyPress)
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
