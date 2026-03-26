'use client'

import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { getHistory } from '@/services/planner'
import {
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  UserPlus,
  Loader2,
  History,
} from 'lucide-react'

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const { data: history, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => getHistory(),
    refetchInterval: 10000,
    enabled: !!session,
  })

  const sortedHistory = history
    ? [...history].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : []

  const currentId = router.query.id as string

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full flex-col bg-[#0f0f0f] transition-all duration-300 ease-in-out ${
          isOpen ? 'w-72' : 'w-0 overflow-hidden md:w-16'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-3">
          {isOpen && (
            <Link href="/" className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="truncate text-base font-bold text-white">
                เที่ยวเถอะชาวไทย
              </span>
            </Link>
          )}
          <button
            onClick={onToggle}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white ${
              !isOpen ? 'mx-auto' : ''
            }`}
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="p-2">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-xl bg-white/5 p-2 text-sm text-gray-300 transition-all hover:bg-white/10 hover:text-white ${
              !isOpen ? 'justify-center' : ''
            }`}
          >
            <Plus className="h-5 w-5 shrink-0" />
            {isOpen && <span>สร้างทริปใหม่</span>}
          </Link>
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto px-2 py-2">
          {isOpen && (
            <div className="mb-2 flex items-center gap-1.5 px-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              <History className="h-3 w-3" />
              ประวัติทริป
            </div>
          )}

          {!session && isOpen && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-gray-400">
              <LogIn className="mx-auto mb-2 h-6 w-6" />
              <p>เข้าสู่ระบบเพื่อดูประวัติทริป</p>
              <Link
                href="/login"
                className="mt-2 inline-block rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          )}

          {session && isLoading && isOpen && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          )}

          {session && sortedHistory.length === 0 && !isLoading && isOpen && (
            <div className="py-8 text-center text-sm text-gray-500">
              ยังไม่มีประวัติทริป
            </div>
          )}

          {session &&
            sortedHistory.map(trip => {
              const isActive = currentId === trip.id
              return (
                <Link
                  key={trip.id}
                  href={`/prompt/${trip.id}`}
                  title={trip.city || trip.question}
                  className={`mb-1 flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition-all ${
                    isOpen ? '' : 'justify-center'
                  } ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  {isOpen && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {trip.city || 'ไม่ระบุสถานที่'}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {trip.question}
                      </p>
                    </div>
                  )}
                </Link>
              )
            })}
        </div>

        <div className="border-t border-white/10 p-2">
          {session ? (
            <div
              className={`flex items-center gap-2 rounded-xl px-2 py-2 ${
                !isOpen ? 'justify-center' : ''
              }`}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  session.user?.firstName + ' ' + session.user?.lastName ||
                    'User',
                )}&background=d01716&color=fff&size=32`}
                alt="avatar"
                className="h-7 w-7 shrink-0 rounded-full"
              />
              {isOpen && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {session.user?.firstName + ' ' + session.user?.lastName}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {session.user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      signOut({ redirect: false })
                      router.push('/')
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ) : (
            isOpen && (
              <div className="flex flex-col gap-1.5 p-1">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white"
                >
                  <LogIn className="h-4 w-4" />
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white transition-all hover:bg-primary/90"
                >
                  <UserPlus className="h-4 w-4" />
                  สมัครสมาชิก
                </Link>
              </div>
            )
          )}
        </div>
      </aside>
    </>
  )
}
