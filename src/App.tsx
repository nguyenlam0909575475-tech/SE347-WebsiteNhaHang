import { useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { initLenis, lockScroll } from './lib/scroll'

import Preloader from './components/layout/Preloader'
import ScrollProgress from './components/layout/ScrollProgress'
import Topbar from './components/layout/Topbar'
import Header from './components/layout/Header'
import BackToTop from './components/layout/BackToTop'
import GsapInspector from './components/layout/GsapInspector'
import Footer from './components/layout/Footer'
import Marquee from './components/Marquee'

import Hero from './components/sections/Hero'
import Pillars from './components/sections/Pillars'
import Story from './components/sections/Story'
import Signature from './components/sections/Signature'
import Menu from './components/sections/Menu'
import Chef from './components/sections/Chef'
import Gallery from './components/sections/Gallery'
import Experience from './components/sections/Experience'
import Testimonials from './components/sections/Testimonials'
import Reservation from './components/sections/Reservation'
import Contact from './components/sections/Contact'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const destroy = initLenis()
    lockScroll(true)
    return destroy
  }, [])

  const handleLoaded = useCallback(() => {
    setReady(true)
    lockScroll(false)
    // fonts + images are in, so every trigger can measure final layout
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [])

  // late images (lazy) change heights: refresh once everything has loaded
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  // Filtering the menu, the booking confirmation, etc. change the page height.
  // Pinned sections further down must then be re-measured.
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return
    let last = main.offsetHeight
    let t = 0
    const ro = new ResizeObserver(() => {
      window.clearTimeout(t)
      t = window.setTimeout(() => {
        const h = main.offsetHeight
        if (Math.abs(h - last) > 2) {
          last = h
          ScrollTrigger.refresh()
        }
      }, 250)
    })
    ro.observe(main)
    return () => {
      ro.disconnect()
      window.clearTimeout(t)
    }
  }, [])

  return (
    <>
      <Preloader onDone={handleLoaded} />
      <ScrollProgress />
      <Topbar />
      <Header />
      <main>
        <Hero ready={ready} />
        <Pillars />
        <Story />
        <Signature />
        <Menu />
        <Marquee />
        <Chef />
        <Gallery />
        <Experience />
        <Testimonials />
        <Reservation />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
      <GsapInspector />
    </>
  )
}
