'use client'

import AppLayout from '@/components/Layouts/App'
import ChatLayout from '@/components/Layouts/ChatLayout'
import { getHistoryById } from '@/services/planner'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import {
  MapPin,
  Calendar,
  Wallet,
  MessageSquare,
  Loader2,
  Clock,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Sun,
  Backpack,
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

function useTypewriter(fullText: string, speed = 12) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const prevTextRef = useRef('')
  const frameRef = useRef<number | null>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!fullText) return
    if (fullText !== prevTextRef.current) {
      prevTextRef.current = fullText
      if (indexRef.current === 0 || indexRef.current > fullText.length) {
        indexRef.current = 0
        setDisplayed('')
        setIsDone(false)
      }
    }
    if (frameRef.current) cancelAnimationFrame(frameRef.current)

    const tick = () => {
      if (indexRef.current >= fullText.length) {
        setIsDone(true)
        return
      }
      indexRef.current = Math.min(indexRef.current + speed, fullText.length)
      setDisplayed(fullText.slice(0, indexRef.current))
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [fullText, speed])

  return { displayed, isDone }
}

const Cursor = () => (
  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
)

export default function PromptDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const bottomRef = useRef<HTMLDivElement>(null)

  const {
    data: planner,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['planner', id],
    queryFn: async () => getHistoryById(id),
    enabled: !!id,
    refetchInterval: query => {
      const data = query.state.data as any
      return data?.planResult ? false : 3000
    },
    refetchIntervalInBackground: true,
  })

  let planData: any = null
  let isJson = false

  if (planner?.planResult) {
    try {
      if (
        planner.planResult.startsWith('{') ||
        planner.planResult.startsWith('[')
      ) {
        planData = JSON.parse(planner.planResult)
        isJson = true
      }
    } catch (e) {
      isJson = false
    }
  }

  const { displayed, isDone } = useTypewriter(
    !isJson && planner?.planResult ? planner.planResult : '',
    12,
  )

  useEffect(() => {
    if (displayed && !isDone) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [displayed, isDone])

  return (
    <AppLayout>
      <ChatLayout>
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto px-4 py-6">
            <div className="mx-auto max-w-3xl">
              <Link
                href="/"
                className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                สร้างทริปใหม่
              </Link>

              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-white">
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                  <p className="animate-pulse text-sm">กำลังดึงข้อมูลทริป...</p>
                </div>
              )}

              {isError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
                  <p className="font-medium">เกิดข้อผิดพลาดในการดึงข้อมูล</p>
                  <Link
                    href="/"
                    className="mt-3 inline-block rounded-lg border border-red-500/30 px-4 py-2 text-sm transition-colors hover:bg-red-500/20"
                  >
                    กลับไปหน้าแรก
                  </Link>
                </div>
              )}

              {planner && (
                <div className="space-y-5">
                  <div className="flex justify-end">
                    <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-[#2a2a2a] px-4 py-3 shadow-md ring-1 ring-white/10">
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-white">
                        <MessageSquare className="h-3 w-3" /> คำขอของคุณ
                      </div>
                      <p className="text-sm leading-relaxed text-gray-100">
                        {planner.question}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>

                    <div className="border-white/8 flex-1 overflow-hidden rounded-2xl rounded-bl-sm border bg-[#212121]">
                      <div className="border-white/8 border-b bg-[#1a1a1a] px-5 py-4">
                        <h2 className="flex items-center gap-2 text-base font-bold text-white">
                          <MapPin className="h-4 w-4 text-primary" />
                          {isJson && planData?.tripName
                            ? ` ${planData.tripName} ✨`
                            : `ทริป ${planner.city || 'ไม่ระบุสถานที่'}`}
                        </h2>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white">
                            <Calendar className="h-3 w-3" />
                            {isJson && planData?.travelDates
                              ? planData.travelDates
                              : planner.travelDates}
                          </span>

                          {isJson && planData?.estimatedCosts?.total ? (
                            <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white">
                              <Wallet className="h-3 w-3" />{' '}
                              {planData.estimatedCosts.total} บาท
                            </span>
                          ) : planner.budget ? (
                            <span className="flex items-center gap-1.5 rounded-lg border border-orange-500/25 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-400">
                              <Wallet className="h-3 w-3" /> ฿
                              {planner.budget.toLocaleString()}
                            </span>
                          ) : null}

                          <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white">
                            <Clock className="h-3 w-3" />
                            {new Date(planner.createdAt).toLocaleDateString(
                              'th-TH',
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="px-5 py-5">
                        {!planner.planResult && (
                          <div className="flex flex-col items-center justify-center gap-3 py-10">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Loader2 className="h-5 w-5 animate-spin text-white" />
                              <span className="text-sm">
                                AI กำลังเขียนแผนการเดินทาง...
                              </span>
                            </div>
                          </div>
                        )}

                        {isJson && planData && (
                          <div className="space-y-6">
                            {planData.weatherSummary && (
                              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm leading-relaxed text-blue-100">
                                <strong className="mb-1 flex items-center gap-2 text-blue-300">
                                  <Sun className="h-4 w-4" /> สรุปสภาพอากาศ
                                </strong>
                                {planData.weatherSummary}
                              </div>
                            )}

                            <div className="space-y-4">
                              <h3 className="flex items-center gap-2 font-semibold text-white">
                                <MapPin className="h-4 w-4 text-[#d01716]" />{' '}
                                แผนการเดินทาง
                              </h3>
                              {planData.itinerary?.map(
                                (day: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                                  >
                                    <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
                                      <span className="text-sm font-bold text-white">
                                        {day.date}
                                      </span>
                                      <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <Sun className="h-3 w-3" />{' '}
                                        {day.weather}
                                      </span>
                                    </div>
                                    <ul className="space-y-4">
                                      {day.activities?.map(
                                        (act: any, aIdx: number) => (
                                          <li key={aIdx} className="text-sm">
                                            <div className="flex items-start gap-2">
                                              <span className="min-w-[35px] font-semibold text-white">
                                                {act.timeOfDay}:
                                              </span>
                                              <div className="flex-1">
                                                <span className="font-medium text-gray-200">
                                                  {act.place}
                                                </span>
                                                {act.mapsLink && (
                                                  <a
                                                    href={act.mapsLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
                                                  >
                                                    <MapPin className="h-2.5 w-2.5" />{' '}
                                                    แผนที่{' '}
                                                    <ExternalLink className="h-2 w-2" />
                                                  </a>
                                                )}
                                                <p className="mt-1.5 border-l-2 border-gray-600 pl-2 text-xs italic text-gray-400">
                                                  {act.reason}
                                                </p>
                                              </div>
                                            </div>
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                ),
                              )}
                            </div>

                            <div className="space-y-3">
                              <h3 className="font-semibold text-white">
                                🏨 ที่พักแนะนำ
                              </h3>
                              <ul className="space-y-2 pl-2 text-sm text-gray-300">
                                {planData.hotels?.map(
                                  (hotel: any, idx: number) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d01716]" />
                                      <span>
                                        <strong className="text-white">
                                          {hotel.name}
                                        </strong>{' '}
                                        - {hotel.highlight}
                                      </span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>

                            {planData.estimatedCosts && (
                              <div className="space-y-3">
                                <h3 className="flex items-center gap-2 font-semibold text-white">
                                  <Wallet className="h-4 w-4 text-[#d01716]" />{' '}
                                  ประมาณการค่าใช้จ่าย
                                </h3>
                                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                                  <div className="divide-y divide-white/5 px-4 py-2 text-sm">
                                    <div className="flex justify-between py-2.5">
                                      <span className="text-gray-400">
                                        🚗 ค่าเดินทาง
                                      </span>
                                      <span className="font-medium text-white">
                                        {planData.estimatedCosts.transportation}
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-2.5">
                                      <span className="text-gray-400">
                                        🍔 ค่าอาหารและเครื่องดื่ม
                                      </span>
                                      <span className="font-medium text-white">
                                        {planData.estimatedCosts.food}
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-2.5">
                                      <span className="text-gray-400">
                                        🎟️ กิจกรรมและค่าเข้าชม
                                      </span>
                                      <span className="font-medium text-white">
                                        {planData.estimatedCosts.activities}
                                      </span>
                                    </div>
                                    <div className="flex justify-between py-2.5">
                                      <span className="text-gray-400">
                                        🛏️ ค่าที่พัก
                                      </span>
                                      <span className="font-medium text-white">
                                        {planData.estimatedCosts.accommodation}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between border-t border-[#d01716]/20 bg-[#d01716]/10 p-4">
                                    <span className="font-bold text-[#d01716]">
                                      รวมประมาณการ (ต่อคน)
                                    </span>
                                    <span className="text-lg font-bold text-white">
                                      {planData.estimatedCosts.total}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {planData.recommendedItems &&
                              planData.recommendedItems.length > 0 && (
                                <div className="space-y-3">
                                  <h3 className="flex items-center gap-2 font-semibold text-white">
                                    <Backpack className="h-4 w-4 text-[#d01716]" />{' '}
                                    ไอเทมแนะนำ (ตามสภาพอากาศ)
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    {planData.recommendedItems.map(
                                      (item: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-200"
                                        >
                                          <Sparkles className="h-3 w-3 text-blue-400" />
                                          {item}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                            {planData.proTip && (
                              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-relaxed text-yellow-100">
                                💡{' '}
                                <strong className="text-yellow-400">
                                  Pro Tip:
                                </strong>{' '}
                                {planData.proTip}
                              </div>
                            )}
                          </div>
                        )}

                        {!isJson && planner.planResult && (
                          <div className="prose-dark text-sm leading-relaxed text-gray-300">
                            {displayed}
                            {!isDone && <Cursor />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} className="h-10" />
            </div>
          </div>

          <div className="border-white/8 border-t bg-[#151515] px-4 py-3">
            <div className="mx-auto max-w-3xl">
              <Link
                href="/"
                className="border-white/8 flex w-full items-center gap-3 rounded-2xl border bg-[#212121] px-4 py-3 text-sm text-white transition-all hover:border-white/15 hover:bg-[#282828] hover:text-gray-400"
              >
                <Sparkles className="h-4 w-4 text-white/60" />
                <span className="flex-1">สร้างทริปใหม่...</span>
                <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-xs text-gray-600">
                  Enter ↵
                </span>
              </Link>
            </div>
          </div>
        </div>
      </ChatLayout>
    </AppLayout>
  )
}
