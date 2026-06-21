
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

export function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 pb-24 md:pb-6">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
