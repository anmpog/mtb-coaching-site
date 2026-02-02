const navMenuButton = document.getElementById('menu-button')
const navMenuBackdrop = document.getElementById('menu-backdrop')
const navMenu = document.getElementById('menu')
const navMenuWrapper = document.getElementById('menu-wrapper')

function toggleBackdropBlur() {
  // console.log(
  //   'blur in classlist: ',
  //   navMenuBackdrop?.classList.contains('blur'),
  // )

  if (!navMenuBackdrop?.classList.contains('blur')) {
    return navMenuBackdrop?.classList.add('blur')
  }

  return navMenuBackdrop?.classList.remove('blur')
}

function toggleMenuVisibility() {
  if (!navMenuWrapper?.classList.contains('expanded')) {
    return navMenuWrapper?.classList.add('expanded')
  }

  return navMenuWrapper?.classList.remove('expanded')
}

document.addEventListener('click', (event) => {
  console.log('click')
  console.log(
    'nav menu contains event target: ',
    navMenu?.contains(event?.target),
  )

  toggleBackdropBlur()
  toggleMenuVisibility()
})
