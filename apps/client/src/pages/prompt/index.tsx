import { useState } from 'react'
import AppLayout from '@/components/Layouts/App'
import PromptNavbar from '@/components/Navbar/prompt-navbar'
import { createPlanner } from '@/services/planner'
import { CreatePlannerArgs } from '@/services/planner/types'
import { useMutation } from '@tanstack/react-query'
import { Send, Sparkles, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function Prompt() {
  const [form, setForm] = useState<CreatePlannerArgs>({
    question: '',
  })

  const PlannerMutation = useMutation({
    mutationFn: async (args: CreatePlannerArgs) => {
      const response = await createPlanner(args)
      if (!response) {
        throw new Error('Failed to create planner')
      }
      return response
    },
    onSuccess: () => {
      toast.success('สร้างแผนการเดินทางสำเร็จ')
    },
    onError: (e: Error) => {
      toast.error(e.message || 'เกิดข้อผิดพลาดในการสร้างทริป')
    },
  })

  const handleCreatePlanner = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.question.trim()) return

    PlannerMutation.mutate({
      question: form.question,
      travelDate: form.travelDate || undefined,
      preferences: form.preferences || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
    })
  }

  const getTripId = () => {
    if (!PlannerMutation.data) return ''
    return (PlannerMutation.data as any).id || ''
  }

  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col">
        <PromptNavbar />
        <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-10 text-gray-800">
          <div className="max-w-3xl">
            {!PlannerMutation.isPending && !PlannerMutation.isSuccess && (
              <div className="mb-10 max-w-2xl text-center transition-opacity duration-300">
                <h1 className="mb-4 flex items-center justify-center gap-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                  <Sparkles className="h-10 w-10 text-primary" />
                  ให้เราจัดทริปเที่ยวให้คุณ
                </h1>
                <p className="text-lg text-gray-500">
                  แค่บอกว่าอยากไปไหน สไตล์ไหน
                  แล้วปล่อยให้ระบบของเราวางแผนการเดินทางและคำนวณงบประมาณให้แบบอัตโนมัติ
                </p>
              </div>
            )}

            {PlannerMutation.isPending && (
              <div className="flex w-full max-w-2xl animate-pulse flex-col items-center justify-center gap-6 rounded-2xl border border-gray-100 bg-white p-12 text-gray-500 shadow-sm">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute h-full w-full animate-ping rounded-full bg-primary/20 opacity-75"></div>
                  <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">
                    เรากำลังจัดทริปให้คุณ...
                  </h3>
                  <p className="text-gray-500">
                    กำลังตรวจสอบสภาพอากาศและคัดสรรสถานที่ที่ดีที่สุด
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    (กรุณารอสักครู่ อาจใช้เวลา 1-2 นาที)
                  </p>
                </div>
              </div>
            )}

            {!PlannerMutation.isPending && PlannerMutation.isSuccess && (
              <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-6 rounded-2xl border border-gray-200 bg-white p-12 text-gray-700 shadow-sm">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    จัดทริปสำเร็จแล้ว!
                  </h3>
                  <p className="mb-6 text-gray-500">
                    เราได้เตรียมแผนการเดินทางที่เหมาะกับคุณไว้เรียบร้อยแล้ว
                  </p>

                  <Link
                    href={`/prompt/${getTripId()}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-medium text-white transition-all hover:-translate-y-1 hover:opacity-90 hover:shadow-lg"
                  >
                    ดูแผนการเดินทางของคุณ <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            )}

            {!PlannerMutation.isPending && !PlannerMutation.isSuccess && (
              <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white p-2 shadow-sm transition-all focus-within:border-transparent focus-within:ring-2 focus-within:ring-gray-300">
                <form
                  onSubmit={handleCreatePlanner}
                  className="flex flex-row gap-3 p-4"
                >
                  <input
                    className="min-h-[50px] w-full resize-none text-lg outline-none placeholder:text-gray-400"
                    placeholder="เช่น อยากไปเที่ยวลพบุรีในช่วง 4-5 มีนาคม งบ 3000..."
                    value={form.question}
                    onChange={e =>
                      setForm({ ...form, question: e.target.value })
                    }
                  />

                  {/* <div className="flex flex-wrap items-center gap-3 border-t border-gray-400 pt-2"> */}
                  <button
                    type="submit"
                    disabled={!form.question.trim()}
                    className={`ml-auto flex items-center justify-center rounded-xl p-4 text-white transition-all hover:opacity-90 ${
                      form.question.trim()
                        ? 'bg-primary'
                        : 'cursor-not-allowed bg-gray-300 opacity-50'
                    } `}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                  {/* </div> */}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
