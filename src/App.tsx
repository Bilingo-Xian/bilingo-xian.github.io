import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Level from './pages/Level'
import Lesson from './pages/Lesson'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/level/:levelId" element={<Level />} />
      <Route path="/lesson/:levelId/:unit/:cycle" element={<Lesson />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
