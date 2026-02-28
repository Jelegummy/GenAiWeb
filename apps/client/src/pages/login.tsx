import Link from 'next/link'
import { useRouter } from 'next/router'
import { getSession, signIn } from 'next-auth/react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FaLock, FaUser } from 'react-icons/fa6'
import { toast } from 'sonner'
import { LoginArgs } from '@/services/user'
import { IoChevronBackSharp } from 'react-icons/io5'
import Image from 'next/image'

const Login = () => {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<LoginArgs>({
    mode: 'onChange',
  })

  const onSubmit: SubmitHandler<LoginArgs> = async data => {
    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (!res?.ok) {
        throw new Error(
          res?.error ?? 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ โปรดลองอีกครั้ง',
        )
      }
      const session = await getSession()

      localStorage.setItem('accessToken', session?.user.accessToken ?? '')
      const userRole = session?.user?.role

      if (userRole === 'USER') {
        router.push('/dashboard/teacher/classroom')
      } else if (userRole === 'ADMIN') {
        router.push('/dashboard/admin')
      }
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4">
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="absolute left-6 top-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-gray-500 transition hover:text-black"
        >
          <IoChevronBackSharp className="w-4" />
          กลับ
        </Link>
      </div>

      <div className="z-10 grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white/80 shadow-2xl backdrop-blur-xl md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-14 md:px-14">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/images/LOGO1.png"
              alt="Logo"
              width={100}
              height={100}
              className="drop-shadow-lg"
            />
            <h1 className="text-3xl font-bold tracking-tight text-gray-800">
              ยินดีต้อนรับกลับมา!
            </h1>
            <p className="text-center text-sm text-gray-500">
              กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-10 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">อีเมล</label>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                <FaUser className="text-gray-400" />
                <input
                  type="email"
                  className="w-full bg-transparent outline-none"
                  placeholder="example@email.com"
                  {...register('email', { required: true })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                <FaLock className="text-gray-400" />
                <input
                  type="password"
                  className="w-full bg-transparent outline-none"
                  placeholder="••••••••"
                  {...register('password', { required: true })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`mt-4 rounded-xl py-3 text-sm font-semibold text-white transition-all duration-300 ${
                !isValid || isSubmitting
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-primary shadow-lg hover:scale-[1.02] hover:shadow-xl'
              }`}
            >
              {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="mt-8 flex justify-center gap-2 text-sm">
            <span className="text-gray-600">ยังไม่มีบัญชี?</span>
            <Link
              href="/register"
              className="font-semibold text-primary transition hover:underline"
            >
              สมัครเลย
            </Link>
          </div>
        </div>

        <div className="relative hidden items-center justify-center md:flex">
          <Image
            src="/images/temple.png"
            alt="Login Illustration"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-indigo-700/70" />

          <div className="relative z-10 max-w-md px-10 text-white">
            <h2 className="text-4xl font-bold leading-tight drop-shadow-lg">
              ค้นพบประสบการณ์
              <br />
              การเดินทางที่ไม่เหมือนใคร
            </h2>
            <p className="mt-4 text-sm text-white/80">
              เข้าสู่ระบบเพื่อเริ่มวางแผนทริปในฝันของคุณ
              ด้วยระบบอัจฉริยะที่ช่วยคุณจัดการทุกอย่างได้ง่ายขึ้น
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
