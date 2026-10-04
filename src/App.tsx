import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Level from './pages/Level'
import Lesson from './pages/Lesson'
import SiteLogo from './components/SiteLogo'
import SideNav from './components/SideNav'
import Feedback from './components/Feedback'

export default function App() {
  return (
    <>
      <SiteLogo />
      <SideNav />
      <Feedback />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/level/:levelId" element={<Level />} />
        <Route path="/lesson/:levelId/:unit/:cycle" element={<Lesson />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  )
}
