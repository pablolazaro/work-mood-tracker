import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Today from './routes/Today'
import Weekly from './routes/Weekly'
import Monthly from './routes/Monthly'
import Yearly from './routes/Yearly'
import { useReminder } from './hooks/useReminder'

const Insights = lazy(() => import('./routes/Insights'))

function AppContent() {
  useReminder()
  return (
    <div className="min-h-screen bg-paper font-sans">
      <div className="pb-24">
        <Suspense fallback={<div className="max-w-sm mx-auto px-4 pt-6"><p className="font-sans text-sm text-muted">Loading…</p></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<Today />} />
            <Route path="/weekly" element={<Weekly />} />
            <Route path="/monthly" element={<Monthly />} />
            <Route path="/yearly" element={<Yearly />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </Suspense>
      </div>
      <BottomNav />
    </div>
  )
}

export default AppContent
