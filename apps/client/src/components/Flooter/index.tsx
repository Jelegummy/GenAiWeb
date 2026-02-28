import Link from 'next/link'
import { MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="text-background bg-[#212121]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <MapPin className="text-primary-foreground h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                {'เที่ยวเถอะชาวไทย'}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white opacity-70">
              {
                'วางแผนเที่ยวทั่วไทยด้วย AI อัจฉริยะ วิเคราะห์ทุกมิติเพื่อทริปที่สมบูรณ์แบบ'
              }
            </p>
          </div>

          <div className="text-white">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-60">
              {'บริการ'}
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/prompt"
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {'วางแผนเที่ยว'}
                </Link>
              </li>
              <li>
                <Link
                  href="/prompt"
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {'วิเคราะห์สภาพอากาศ'}
                </Link>
              </li>
              <li>
                <Link
                  href="/prompt"
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {'ประมาณการงบ'}
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-white">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-60">
              {'เกี่ยวกับเรา'}
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/"
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {'เกี่ยวกับ'}
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {'ติดต่อเรา'}
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {'นโยบายความเป็นส่วนตัว'}
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-white">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-60">
              {'บัญชี'}
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/login"
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {'เข้าสู่ระบบ'}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm opacity-70 transition-opacity hover:opacity-100"
                >
                  {'สมัครสมาชิก'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-background/10 mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-xs text-white opacity-50">
            {'2026 เที่ยวเถอะชาวไทย. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
