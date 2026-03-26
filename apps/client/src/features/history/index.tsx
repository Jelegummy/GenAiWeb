'use client'

import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { deleteHistory } from '@/services/planner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteTripButton({
  id,
  isActive,
}: {
  id: string
  isActive: boolean
}) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHistory(id),
    onSuccess: () => {
      toast.success('ลบประวัติสำเร็จ')
      queryClient.invalidateQueries({ queryKey: ['history'] })
      setIsModalOpen(false)

      if (isActive) {
        router.push('/')
      }
    },
    onError: () => {
      toast.error('ไม่สามารถลบประวัติได้')
      setIsModalOpen(false)
    },
  })

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsModalOpen(true)
  }

  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    deleteMutation.mutate(id)
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsModalOpen(false)
  }

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={deleteMutation.isPending}
        title="ลบทริป"
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 opacity-0 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50 group-hover:opacity-100"
      >
        {deleteMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity"
          onClick={cancelDelete}
        >
          <div
            className="w-full max-w-[320px] scale-100 rounded-3xl border border-white/10 bg-[#1e1f22] p-6 shadow-2xl transition-transform"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">ลบการสนทนา?</h3>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              ระบบจะลบทริปนี้ออกจากประวัติของคุณอย่างถาวร และไม่สามารถกู้คืนได้
            </p>

            <div className="mt-8 flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                disabled={deleteMutation.isPending}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 rounded-full bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                ลบเลย
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
