'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { LogIn, LogOut, Menu, X } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaCircleUser } from 'react-icons/fa6'

const Navbar = () => {
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div
        className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 sm:px-6 sm:py-3 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md'
            : 'border border-white/30 bg-white/20 backdrop-blur-sm'
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-1 transition-transform hover:scale-105 sm:gap-2"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex items-center justify-center rounded-full shadow-sm">
            <Image
              src="/images/LOGO1.png"
              alt="Logo"
              width={65}
              height={65}
              className="h-[45px] w-[45px] drop-shadow-lg sm:h-[65px] sm:w-[65px]"
            />
          </div>
          <h1
            className={`text-lg font-extrabold tracking-tight sm:text-xl ${
              isScrolled || isMobileMenuOpen ? 'text-gray-900' : 'text-white'
            }`}
          >
            เที่ยวเถอะ<span className="text-primary">ชาวไทย</span>
          </h1>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40"
              >
                วางแผนเที่ยว
              </Link>
              <button
                onClick={() => signOut()}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-red-500 hover:text-white ${
                  isScrolled
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-white/20 text-white'
                }`}
                title="ออกจากระบบ"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                    isScrolled
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  เข้าสู่ระบบ
                </button>
              </Link>
              <Link href="/register">
                <button className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40">
                  <FaCircleUser className="h-4 w-4" />
                  สมัครสมาชิก
                </button>
              </Link>
            </>
          )}
        </div>

        <button
          className={`p-2 transition-colors md:hidden ${
            isScrolled || isMobileMenuOpen ? 'text-gray-900' : 'text-white'
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-7 w-7" />
          ) : (
            <Menu className="h-7 w-7" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="animate-in slide-in-from-top-4 fade-in fixed left-1/2 top-24 z-40 flex w-[calc(100%-2rem)] -translate-x-1/2 flex-col gap-3 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-md duration-200 md:hidden">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md active:scale-95"
              >
                วางแผนเที่ยว
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  signOut()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-500 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 active:scale-95">
                  <LogIn className="h-4 w-4" />
                  เข้าสู่ระบบ
                </button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md active:scale-95">
                  <FaCircleUser className="h-4 w-4" />
                  สมัครสมาชิก
                </button>
              </Link>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default Navbar
