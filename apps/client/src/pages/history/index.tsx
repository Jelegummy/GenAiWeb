'use client'

import AppLayout from '@/components/Layouts/App'
import HistorytNavbar from '@/components/Navbar/history'
import { getHistory } from '@/services/planner'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin,
  Calendar,
  Wallet,
  Sparkles,
  Clock,
  ArrowRight,
  Loader2,
  Compass,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

export default function History() {
  const {
    data: history,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['history'],
    queryFn: async () => getHistory(),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  return (
    <AppLayout>
      <HistorytNavbar />
      <div className="min-h-screen bg-[#f8fafc] pb-20 pt-10 text-gray-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-gray-900">
                <Compass className="h-7 w-7 text-primary" />
                ประวัติทริปของฉัน
              </h1>
              <p className="mt-2 text-gray-500">
                รวมแผนการเดินทางทั้งหมดที่คุณให้ AI ช่วยจัดไว้ที่นี่
              </p>
            </div>
            <Link
              href="/prompt"
              className="text-md mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow md:mt-0"
            >
              <Sparkles className="h-3 w-3" />
              สร้างทริปใหม่
            </Link>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-32 text-gray-500">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="animate-pulse">
                กำลังดึงข้อมูลประวัติทริปของคุณ...
              </p>
            </div>
          )}

          {isError && (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-red-600 shadow-sm">
              <p className="text-xl font-semibold">
                เกิดข้อผิดพลาดในการดึงข้อมูล
              </p>
              <p className="mt-2 opacity-80">กรุณาลองรีเฟรชหน้าใหม่อีกครั้ง</p>
            </div>
          )}

          {history && history.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white py-32 text-center shadow-sm">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                <Compass className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                ยังไม่มีประวัติการจัดทริป
              </h2>
              <p className="mt-2 max-w-md text-gray-500">
                คุณยังไม่เคยสร้างแผนการเดินทางเลย ลองให้ AI
                ของเราจัดทริปแรกให้คุณดูสิ!
              </p>
              <Link
                href="/prompt"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white shadow-sm transition-all hover:-translate-y-1 hover:bg-primary/90 hover:shadow-md"
              >
                <Sparkles className="h-5 w-5" />
                เริ่มสร้างทริปแรกกันเลย
              </Link>
            </div>
          )}

          {history && history.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {history
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map(trip => (
                  <div
                    key={trip.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl"
                  >
                    {/* <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150"></div> */}

                    <div className="relative z-10">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <h3 className="line-clamp-1 flex items-center gap-2 text-xl font-bold text-gray-900">
                          <MapPin className="h-6 w-6 shrink-0 text-primary" />
                          {trip.city || 'ทริปไม่ระบุสถานที่'}
                        </h3>
                      </div>

                      <div className="mb-6 flex flex-wrap gap-2">
                        {trip.travelDates && (
                          <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>{trip.travelDates}</span>
                          </div>
                        )}
                        {trip.budget ? (
                          <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                            <Wallet className="h-3.5 w-3.5 text-orange-500" />
                            <span>฿{trip.budget.toLocaleString()}</span>
                          </div>
                        ) : null}
                        {trip.preferences && (
                          <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                            <span className="line-clamp-1 max-w-[100px]">
                              {trip.preferences}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mb-6 rounded-xl bg-gray-50 p-3 text-sm text-black/80">
                        <div className="mb-1 flex items-center gap-1.5 font-semibold">
                          <MessageSquare className="h-4 w-4" />
                          คำขอของคุณ:
                        </div>
                        <p className="line-clamp-2 italic">"{trip.question}"</p>
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(trip.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>

                      {trip.planResult ? (
                        <Link
                          href={`/prompt/${trip.id}`}
                          className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                        >
                          ดูแผนทริป <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-600">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />{' '}
                          กำลังจัด...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
