function upgradeIntralink(el) {
  const elUpgraded = el.getAttribute('upgraded')
  if (elUpgraded && !elUpgraded.contains(',intralink')) return
  let target = el.getAttribute('target')
  if (!target) target = '#'
  el.addEventListener('click', () => {
    history.pushState({}, '', target)
    loadCurrentPage()
  })
  el.setAttribute('upgraded', el.getAttribute('upgraded') + ',intralink')
}

document.addEventListener('DOMContentLoaded', () => {
  const intralinks = document.querySelectorAll('[role=intralink]')
  for (let i = 0; i < intralinks.length; i++) {
    upgradeIntralink(intralinks[i])
  }
})
