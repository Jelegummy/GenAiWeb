'use client'

import Navbar from '@/components/Navbar'
import { MapPin, Search, Compass, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { DestinationsSection } from '@/components/Destinations'
import { Footer } from '@/components/Flooter'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <div className="relative flex h-[90vh] min-h-[600px] w-full items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2000&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-50"></div>
        </div>

        <div className="relative z-10 mt-20 flex w-full max-w-5xl flex-col items-center px-4 text-center">
          {/* <span className="mb-4 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
            🇹🇭 ค้นพบสยามเมืองยิ้ม ในมุมมองใหม่
          </span> */}
          <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-7xl">
            ออกไปเที่ยว <span className="text-primary">ประเทศไทย</span>{' '}
            {/* <br className="hidden sm:block" /> */}
            ไปกับเรา
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-200 drop-shadow-md sm:text-xl">
            แพลตฟอร์มวางแผนการท่องเที่ยวที่ช่วยให้คุณ ไม่ต้องกังวลกับสภาพอากาศ
            หรือการเตรียมตัวอีกต่อไป
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
            {session?.user ? (
              <Link
                href={'/dashboard'}
                className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-white shadow-lg shadow-primary/40 transition-all hover:-translate-y-1 hover:bg-primary/90 hover:shadow-xl sm:w-auto"
              >
                เริ่มวางแผนเที่ยว
                <MapPin className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href="/register" className="w-full sm:w-auto">
                    <button className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 sm:w-52">
                      <MapPin className="h-5 w-5" />
                      วางแผนเที่ยว
                    </button>
                  </Link>

                  <Link href="/login" className="w-full sm:w-auto">
                    <button className="flex w-full items-center justify-center rounded-full border-2 border-primary/30 bg-white px-8 py-3.5 text-base font-semibold text-primary transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary/5 sm:w-52">
                      ลงชื่อเข้าใช้
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <DestinationsSection />
      <Footer />
    </div>
  )
}
