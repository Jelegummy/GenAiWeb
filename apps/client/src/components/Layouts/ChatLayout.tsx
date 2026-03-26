import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Menu, LogIn, UserPlus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import ChatSidebar from '../Sidebar/ChatSidebar'

const ChatLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { data: session } = useSession()

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          sidebarOpen ? 'md:ml-72' : 'md:ml-16'
        }`}
      >
        <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#1a1a1a]/80 px-4 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold">เที่ยวเถอะชาวไทย</span>
          </Link>

          <div className="hidden md:flex" />

          <div className="flex items-center gap-2">
            {!session && (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-1.5 text-sm font-medium text-gray-300 transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-primary/90"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">สมัครสมาชิก</span>
                </Link>
              </>
            )}
            {session && (
              <div className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    session.user?.firstName + ' ' + session.user?.lastName ||
                      'User',
                  )}&background=d01716&color=fff&size=28`}
                  alt="avatar"
                  className="h-6 w-6 rounded-full"
                />
                <span className="hidden text-sm font-medium text-gray-200 sm:inline">
                  {session.user?.firstName}
                </span>
                <span className="hidden text-sm font-medium text-gray-200 sm:inline">
                  {session.user?.lastName}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default ChatLayout
