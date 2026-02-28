import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { SubmitHandler, useForm } from 'react-hook-form'
import { IoChevronBackSharp, IoMail } from 'react-icons/io5'
import { FaLock } from 'react-icons/fa6'
import { toast } from 'sonner'
import Image from 'next/image'

import {
  RegisterArgs as BaseRegisterArgs,
  register as registerFn,
} from '@/services/user'

type RegisterForm = BaseRegisterArgs & {
  confirmPassword: string
}

const Register = () => {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<RegisterForm>({
    mode: 'onChange',
  })

  const registerMutation = useMutation({
    mutationFn: (args: BaseRegisterArgs) => registerFn(args),
  })

  const onSubmit: SubmitHandler<RegisterForm> = async args => {
    try {
      if (args.password !== args.confirmPassword) {
        throw new Error('รหัสผ่านไม่ตรงกัน')
      }
      if (args.password.length < 8) {
        throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      }

      await registerMutation.mutateAsync({
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
        password: args.password,
        phoneNumber: args.phoneNumber,
      })

      toast.success('สมัครสมาชิกสำเร็จ')
      router.push('/login')
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
              สร้างบัญชีใหม่
            </h1>
            <p className="text-center text-sm text-gray-500">
              กรอกข้อมูลด้านล่างเพื่อเริ่มต้นใช้งาน
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-10 flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border border-gray-200 px-4 py-3 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="ชื่อ"
                {...register('firstName', { required: true })}
              />
              <input
                className="rounded-xl border border-gray-200 px-4 py-3 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="นามสกุล"
                {...register('lastName', { required: true })}
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
              <IoMail className="text-gray-400" />
              <input
                type="email"
                className="w-full bg-transparent outline-none"
                placeholder="อีเมล"
                {...register('email', { required: true })}
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
              <FaLock className="text-gray-400" />
              <input
                type="password"
                className="w-full bg-transparent outline-none"
                placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                {...register('password', { required: true })}
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
              <FaLock className="text-gray-400" />
              <input
                type="password"
                className="w-full bg-transparent outline-none"
                placeholder="ยืนยันรหัสผ่าน"
                {...register('confirmPassword', { required: true })}
              />
            </div>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`rounded-xl py-3 text-sm font-semibold text-white transition-all duration-300 ${
                !isValid || isSubmitting
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-primary shadow-lg hover:scale-[1.02] hover:shadow-xl'
              }`}
            >
              {isSubmitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            มีบัญชีแล้ว?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary transition hover:underline"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>

        <div className="relative hidden items-center justify-center md:flex">
          <Image
            src="/images/waterfall.png"
            alt="Register Illustration"
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

export default Register
