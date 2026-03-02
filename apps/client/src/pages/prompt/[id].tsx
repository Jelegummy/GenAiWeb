'use client'

import AppLayout from '@/components/Layouts/App'
import { getHistoryById } from '@/services/planner'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Wallet,
  Sparkles,
  MessageSquare,
  Loader2,
  Clock,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import React from 'react'

export default function PromptDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const {
    data: planner,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['planner', id],
    queryFn: async () => getHistoryById(id),
    enabled: !!id,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  })

  const formatMarkdown = (text: string) => {
    if (!text) return ''
    let formatted = text
      .replace(/\[([^\]]+)\][\s\n]*\((https?:\/\/[^\)]+)\)/g, '[$1]($2)')

      .replace(/^(?:\*\*|\s)*(🗺️|🏨|💰)(.*?)(?:\*\*|\s)*$/gm, '\n## $1 $2\n')

      .replace(/^(?:\*\*|\s)*📍\s*(.*?)(?:\*\*|\s)*$/gm, '\n### 📍 $1\n')

      .replace(/^(?:\*\*|\s)*(เช้า|สาย|บ่าย|เย็น|ค่ำ|ดึก):/gm, '**$1:**')

      .replace(/^\s*\*\*\s*$/gm, '')

      .replace(/\n{3,}/g, '\n\n')

    return formatted
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#f8fafc] pb-20 text-gray-800">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center gap-4">
            <Link
              href="/prompt"
              className="rounded-full p-2 text-gray-600 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Sparkles className="h-5 w-5 text-primary" />
              แผนการเดินทางของคุณ
            </h1>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-4xl px-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-500">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="animate-pulse">กำลังดึงข้อมูลทริปของคุณ...</p>
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 py-12 text-center text-red-600">
              <p className="text-lg font-medium">
                เกิดข้อผิดพลาดในการดึงข้อมูล
              </p>
              <Link
                href="/prompt"
                className="mt-4 inline-block rounded-lg bg-red-100 px-4 py-2 transition-colors hover:bg-red-200"
              >
                กลับไปหน้าแรก
              </Link>
            </div>
          )}

          {planner && (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl"></div>

                <div className="relative z-10 mb-6 flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-600">
                  <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-primary opacity-80" />
                  <div>
                    <p className="mb-1 text-sm font-semibold text-primary opacity-80">
                      เป้าหมายทริปของคุณ:
                    </p>
                    <p className="italic leading-relaxed">
                      "{planner.question}"
                    </p>
                  </div>
                </div>

                <h2 className="mb-6 flex items-center gap-3 text-3xl font-bold text-gray-900 md:text-4xl">
                  <MapPin className="h-8 w-8 text-primary" />
                  ทริป {planner.city || 'ไม่ระบุสถานที่'}
                </h2>

                <div className="relative z-10 flex flex-wrap gap-3">
                  {planner.travelDates && (
                    <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                      <Calendar className="h-4 w-4" />
                      <span>{planner.travelDates}</span>
                    </div>
                  )}
                  {planner.budget ? (
                    <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600">
                      <Wallet className="h-4 w-4" />
                      <span>งบ {planner.budget.toLocaleString()} บาท</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(planner.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-10">
                {!planner.planResult ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                    <p className="animate-pulse">
                      AI กำลังเขียนแผนการเดินทาง...
                    </p>
                  </div>
                ) : (
                  <div className="relative ml-2 max-w-none border-l-2 border-gray-200 pl-6 md:ml-4 md:pl-8">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ node, ...props }) => (
                          <h2
                            className="relative -left-[35px] mb-6 mt-12 flex items-center gap-2 border-b-2 border-gray-100 bg-white py-2 text-2xl font-bold text-gray-900 md:-left-[43px]"
                            {...props}
                          >
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary ring-4 ring-primary/20"></span>
                            {props.children}
                          </h2>
                        ),
                        h3: ({ node, ...props }) => (
                          <div className="relative mb-4 mt-8">
                            <div className="absolute -left-[35px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-4 border-primary bg-white shadow-sm ring-4 ring-white md:-left-[43px]" />
                            <h3
                              className="inline-block rounded-xl px-4 py-2 text-lg font-bold text-white shadow-md"
                              {...props}
                            />
                          </div>
                        ),
                        p: ({ node, children, ...props }) => {
                          let textContent = ''
                          React.Children.forEach(children, child => {
                            if (typeof child === 'string') textContent += child
                          })

                          const text = textContent.trim()

                          if (
                            text.startsWith('✨') ||
                            text.startsWith('🗓️') ||
                            text.startsWith('🎒') ||
                            text.startsWith('💡') ||
                            text.startsWith('สภาพอากาศล่วงหน้า') ||
                            text.includes('ไม่มีผลการพยากรณ์')
                          ) {
                            return (
                              <p
                                className="mb-4 mt-4 font-medium leading-relaxed text-gray-700"
                                {...props}
                              >
                                {children}
                              </p>
                            )
                          }

                          return (
                            <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 leading-relaxed text-gray-600 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                              {children}
                            </div>
                          )
                        },
                        strong: ({ node, ...props }) => (
                          <strong
                            className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="mb-6 ml-2 list-none space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            className="flex items-start gap-2 text-gray-600"
                            {...props}
                          >
                            <span className="mt-1.5 inline-block h-1.5 min-w-[6px] rounded-full bg-primary text-primary"></span>
                            <span className="leading-relaxed">
                              {props.children}
                            </span>
                          </li>
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            href={props.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-1 mt-2 inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            {props.children === 'Google Maps'
                              ? 'เปิด Google Maps'
                              : props.children}
                            <ExternalLink className="ml-0.5 h-3.5 w-3.5 opacity-70" />
                          </a>
                        ),
                      }}
                    >
                      {formatMarkdown(planner.planResult)}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
