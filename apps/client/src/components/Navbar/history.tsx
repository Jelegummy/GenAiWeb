import { MapPin, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { MdOutlineCardTravel } from 'react-icons/md'

export default function HistorytNavbar() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-foreground text-lg font-bold tracking-tight">
            {'เที่ยวเถอะชาวไทย'}
          </span>
        </Link>
      </div>
    </header>
  )
}
