import { useState, useRef, useEffect, useCallback } from 'react'
import AppLayout from '@/components/Layouts/App'
import ChatLayout from '@/components/Layouts/ChatLayout'
import { createPlanner } from '@/services/planner'
import { CreatePlannerArgs, Planner } from '@/services/planner/types'
import {
  Send,
  Sparkles,
  Loader2,
  MapPin,
  Calendar,
  Wallet,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sun,
  ExternalLink,
  Backpack,
} from 'lucide-react'
import { toast } from 'sonner'
import React from 'react'

type ChatEntry = {
  id: string
  role: 'user' | 'ai'
  content: string
  isCreating?: boolean
  error?: string | null
}

const SUGGESTIONS = [
  'อยากไปเที่ยวเชียงใหม่ 3 วัน งบ 5,000 บาท',
  'วางแผนทัวร์ภูเก็ต 2 วัน สำหรับคู่รัก',
  'ที่เที่ยวแนะนำในกรุงเทพสำหรับ 1 วัน',
  'ทริปอยุธยา ราคาประหยัด งบ 1,500',
]

function useTypewriter(fullText: string, charsPerFrame = 3) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const rafRef = useRef<number | null>(null)
  const idxRef = useRef(0)
  const prevFullRef = useRef('')

  useEffect(() => {
    if (!fullText) return
    if (fullText !== prevFullRef.current) {
      prevFullRef.current = fullText
      idxRef.current = 0
      setDisplayed('')
      setIsDone(false)
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const step = () => {
      if (idxRef.current >= fullText.length) {
        setIsDone(true)
        return
      }
      idxRef.current = Math.min(idxRef.current + charsPerFrame, fullText.length)
      setDisplayed(fullText.slice(0, idxRef.current))
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [fullText, charsPerFrame])

  return { displayed, isDone }
}

const Cursor = () => (
  <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-primary align-middle" />
)
const TypingDots = () => (
  <div className="flex gap-1.5">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="h-2 w-2 rounded-full bg-primary/50"
        style={{ animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
      />
    ))}
  </div>
)

function AiMessage({
  content,
  isCreating,
}: {
  content: string
  isCreating?: boolean
}) {
  let planData: any = null
  let isJson = false

  try {
    if (content.startsWith('{') || content.startsWith('[')) {
      planData = JSON.parse(content)
      isJson = true
    }
  } catch (e) {
    isJson = false
  }

  const { displayed, isDone } = useTypewriter(!isJson ? content : '', 2)

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      <div
        className="border-white/8 flex-1 overflow-hidden rounded-2xl rounded-bl-sm border bg-[#212121]"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {isCreating && (
          <div className="px-4 py-4">
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                AI กำลังประมวลผล...
              </div>
              <TypingDots />
            </div>
          </div>
        )}

        {!isCreating && !isJson && (
          <div className="px-4 py-4 text-sm leading-relaxed text-gray-200">
            {displayed}
            {!isDone && <Cursor />}
          </div>
        )}

        {!isCreating && isJson && planData && (
          <div>
            <div className="border-white/8 border-b bg-[#1c1c1c] px-4 py-3">
              <h2 className="text-lg font-bold text-white">
                {planData.tripName} ✨
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white">
                  <Calendar className="h-3 w-3" /> {planData.travelDates}
                </span>
                {planData.estimatedCosts?.total && (
                  <span className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white">
                    <Wallet className="h-3 w-3" /> ฿
                    {planData.estimatedCosts.total} บาท
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6 p-4">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  <MapPin className="h-4 w-4 text-[#d01716]" /> แผนการเดินทาง
                </h3>
                {planData.itinerary?.map((day: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-sm font-bold text-white">
                        {day.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Sun className="h-3 w-3" /> {day.weather}
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {day.activities?.map((act: any, aIdx: number) => (
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
                                  <MapPin className="h-2.5 w-2.5" /> แผนที่{' '}
                                  <ExternalLink className="h-2 w-2" />
                                </a>
                              )}
                              <p className="mt-1.5 border-l-2 border-gray-600 pl-2 text-xs italic text-gray-400">
                                {act.reason}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-white">🏨 ที่พักแนะนำ</h3>
                <ul className="space-y-2 pl-2 text-sm text-gray-300">
                  {planData.hotels?.map((hotel: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d01716]" />
                      <span>
                        <strong className="text-white">{hotel.name}</strong> -{' '}
                        {hotel.highlight}
                      </span>
                    </li>
                  ))}
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
                        <span className="text-gray-400">🚗 ค่าเดินทาง</span>
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
                        <span className="text-gray-400">🛏️ ค่าที่พัก</span>
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
                      <Backpack className="h-4 w-4 text-[#d01716]" /> ไอเทมแนะนำ
                      (ตามสภาพอากาศ)
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
                  💡 <strong className="text-yellow-400">Pro Tip:</strong>{' '}
                  {planData.proTip}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatEntry[]>([])
  const [input, setInput] = useState('')
  const [currentTripId, setCurrentTripId] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [travelDate, setTravelDate] = useState('')
  const [budget, setBudget] = useState('')
  const [preferences, setPreferences] = useState('')
  const [isSending, setIsSending] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isEmpty = messages.length === 0

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }, [input])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (question: string) => {
    if (!question.trim() || isSending) return

    const userMsgId = crypto.randomUUID()
    const aiMsgId = crypto.randomUUID()

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: question },
      { id: aiMsgId, role: 'ai', content: '', isCreating: true },
    ])
    setInput('')
    setIsSending(true)

    try {
      const args: CreatePlannerArgs = {
        tripId: currentTripId || undefined,
        question,
        travelDate: travelDate || undefined,
        preferences: preferences || undefined,
        budget: budget ? Number(budget) : undefined,
      }

      const result = (await createPlanner(args)) as any

      if (!currentTripId && result?.id) {
        setCurrentTripId(result.id)
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsgId
            ? { ...m, content: result.planResult, isCreating: false }
            : m,
        ),
      )
    } catch (e: any) {
      toast.error(e.message || 'เกิดข้อผิดพลาด')
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsgId
            ? { ...m, isCreating: false, error: e.message || 'เกิดข้อผิดพลาด' }
            : m,
        ),
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <AppLayout>
      <ChatLayout>
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto">
            {isEmpty ? (
              <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-white">
                  วางแผนทริปด้วย AI
                </h1>
                <p className="mb-8 text-sm text-gray-400">
                  บอกว่าอยากไปไหน สไตล์ไหน งบเท่าไหร่ — AI จะจัดให้ทุกอย่าง
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(s)
                        textareaRef.current?.focus()
                      }}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-gray-300 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-white sm:text-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'user' ? (
                      <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-[#2a2a2a] px-4 py-3 ring-1 ring-white/10">
                        <p className="text-sm leading-relaxed text-gray-100">
                          {msg.content}
                        </p>
                      </div>
                    ) : msg.error ? (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/20">
                          <Sparkles className="h-4 w-4 text-red-400" />
                        </div>
                        <div className="rounded-2xl rounded-bl-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                          เกิดข้อผิดพลาด: {msg.error}
                        </div>
                      </div>
                    ) : (
                      <AiMessage
                        content={msg.content}
                        isCreating={msg.isCreating}
                      />
                    )}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="border-white/8 border-t bg-[#151515] px-4 py-4">
            <div className="mx-auto max-w-3xl">
              {showAdvanced && (
                <div className="mb-3 grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" />
                    <input
                      type="text"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                      placeholder="วันที่เดินทาง"
                      value={travelDate}
                      onChange={e => setTravelDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                    <Wallet className="h-4 w-4 shrink-0 text-primary" />
                    <input
                      type="number"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                      placeholder="งบประมาณ (บาท)"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 sm:col-span-2">
                    <Sliders className="h-4 w-4 shrink-0 text-primary" />
                    <input
                      type="text"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                      placeholder="ความชอบ เช่น ทะเล, ภูเขา"
                      value={preferences}
                      onChange={e => setPreferences(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div
                className="flex flex-col rounded-2xl border transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  className="w-full resize-none bg-transparent px-4 pb-1 pt-3 text-sm text-white outline-none placeholder:text-gray-600 sm:text-base"
                  placeholder={
                    isEmpty ? 'บอกเราว่าอยากไปไหน...' : 'ถามต่อได้เลย...'
                  }
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex items-center justify-between px-3 pb-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(v => !v)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-white/10 hover:text-gray-300"
                  >
                    <Sliders className="h-3.5 w-3.5" /> ตัวเลือกเพิ่มเติม{' '}
                    {showAdvanced ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isSending}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${input.trim() && !isSending ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white/8 cursor-not-allowed text-gray-700'}`}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ChatLayout>
    </AppLayout>
  )
}
