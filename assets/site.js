/* Bilingo Bonus Box — site behaviour.
   Plain JavaScript, no libraries. Three jobs:
   1. theme switching (day / night / bilingo), remembered in localStorage
   2. hash navigation: which lesson (or the overview) is visible + scroll to top
   3. picture viewer: open a picture set, move with on-screen arrows / keyboard,
      and start preloading the pictures as soon as a lesson is opened
   PICSETS is defined in GE3.html (generated from the site data).            */

(function () {
  'use strict'

  /* ---------------- themes ---------------- */
  var THEMES = ['day', 'night', 'bilingo']
  function applyTheme(name) {
    if (THEMES.indexOf(name) < 0) name = 'day'
    document.documentElement.setAttribute('data-theme', name === 'day' ? '' : name)
    if (name === 'day') document.documentElement.removeAttribute('data-theme')
    try { localStorage.setItem('bilingo-theme', name) } catch (e) {}
    document.querySelectorAll('.theme-switch button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.theme === name)
    })
  }
  window.bilingoTheme = applyTheme

  /* ---------------- navigation ---------------- */
  // Lessons and units register themselves via data attributes:
  //   <section class="lesson" data-lesson="U1C1" ...>
  //   <section class="unit-section" id="unit-1" ...>
  var lessons = [] // filled on DOMContentLoaded, in document order

  function currentHash() {
    return decodeURIComponent(location.hash.replace(/^#\/?/, ''))
  }

  function showLesson(code) {
    var found = false
    lessons.forEach(function (sec) {
      var on = sec.dataset.lesson === code
      sec.classList.toggle('open', on)
      if (on) {
        found = true
        document.title = sec.dataset.title + ' — Bilingo Bonus Box'
        preload(sec)
      }
    })
    var ov = document.getElementById('overview')
    if (ov) ov.classList.toggle('hidden-view', found)
    if (found) window.scrollTo(0, 0)
    return found
  }

  function showOverview(scrollToId) {
    lessons.forEach(function (sec) { sec.classList.remove('open') })
    var ov = document.getElementById('overview')
    if (ov) ov.classList.remove('hidden-view')
    document.title = 'GE 3 — Bilingo Bonus Box'
    if (scrollToId) {
      var el = document.getElementById(scrollToId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo(0, 0)
    }
  }

  function route() {
    // only GE3.html has lesson sections — other pages skip the router entirely
    if (!lessons.length) return
    var h = currentHash()
    if (h && showLesson(h)) return
    if (h.indexOf('unit-') === 0) { showOverview(h); return }
    showOverview(null)
  }
  window.addEventListener('hashchange', route)

  /* ---------------- picture preloading ---------------- */
  function preload(sec) {
    var code = sec.dataset.lesson
    var set = window.PICSETS && window.PICSETS[code]
    if (!set) return
    set.forEach(function (src) { var im = new Image(); im.src = src })
  }

  /* ---------------- picture viewer ---------------- */
  var viewer, vImg, vCount, vName, vPrev, vNext, vClose
  var curSet = null, curIdx = 0

  function setOf(code) {
    var s = window.PICSETS && window.PICSETS[code]
    return s && s.length ? s : null
  }

  function render() {
    var src = curSet[curIdx]
    vImg.src = src
    vCount.textContent = (curIdx + 1) + ' / ' + curSet.length
    var parts = src.split('/')
    vName.textContent = decodeURIComponent(parts[parts.length - 1])
    vPrev.style.visibility = curIdx > 0 ? 'visible' : 'hidden'
    vNext.style.visibility = curIdx < curSet.length - 1 ? 'visible' : 'hidden'
    // warm the neighbours so arrows feel instant
    ;[curIdx - 1, curIdx + 1].forEach(function (i) {
      if (i >= 0 && i < curSet.length) { var im = new Image(); im.src = curSet[i] }
    })
  }

  window.bilingoOpenPic = function (code, idx) {
    var s = setOf(code)
    if (!s) return
    curSet = s
    curIdx = idx || 0
    render()
    viewer.classList.add('open')
    document.body.style.overflow = 'hidden'
  }
  function closeViewer() {
    viewer.classList.remove('open')
    document.body.style.overflow = ''
  }
  function step(d) {
    if (!curSet) return
    curIdx = Math.min(curSet.length - 1, Math.max(0, curIdx + d))
    render()
  }

  /* ---------------- boot ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    lessons = Array.prototype.slice.call(document.querySelectorAll('.lesson[data-lesson]'))

    viewer = document.getElementById('viewer')
    vImg = document.getElementById('viewer-img')
    vCount = document.getElementById('viewer-count')
    vName = document.getElementById('viewer-name')
    vPrev = document.getElementById('viewer-prev')
    vNext = document.getElementById('viewer-next')
    vClose = document.getElementById('viewer-close')
    if (viewer) {
      vPrev.addEventListener('click', function () { step(-1) })
      vNext.addEventListener('click', function () { step(1) })
      vClose.addEventListener('click', closeViewer)
      viewer.addEventListener('click', function (e) { if (e.target === viewer) closeViewer() })
      document.addEventListener('keydown', function (e) {
        if (!viewer.classList.contains('open')) return
        if (e.key === 'Escape') closeViewer()
        if (e.key === 'ArrowLeft') step(-1)
        if (e.key === 'ArrowRight') step(1)
      })
    }

    // theme buttons (there can be several on a page, all stay in sync)
    document.querySelectorAll('.theme-switch button').forEach(function (b) {
      b.addEventListener('click', function () { applyTheme(b.dataset.theme) })
    })
    var saved = null
    try { saved = localStorage.getItem('bilingo-theme') } catch (e) {}
    applyTheme(saved || 'day')

    route()
  })
})()
