import Image from 'next/image'
import { MapPin } from 'lucide-react'

const destinations = [
  {
    image: '/images/temple.png',
    title: 'วัดและวัฒนธรรม',
    location: 'กรุงเทพมหานคร',
    description: 'สำรวจวัดที่งดงามและวัฒนธรรมอันล้ำค่า',
  },
  {
    image: '/images/sea.png',
    title: 'ทะเลและหาดทราย',
    location: 'ภาคใต้',
    description: 'พักผ่อนริมทะเลครามกับหาดทรายขาว',
  },
  {
    image: '/images/waterfall.png',
    title: 'ธรรมชาติและน้ำตก',
    location: 'ภาคเหนือ',
    description: 'ดื่มด่ำกับธรรมชาติอันอุดมสมบูรณ์',
  },
  {
    image: '/images/food.png',
    title: 'อาหารไทยชื่อดัง',
    location: 'ทั่วไทย',
    description: 'ลิ้มรสอาหารไทยแท้จากทุกภาค',
  },
]

export function DestinationsSection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto mt-16 max-w-7xl px-6">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
            {'สถานที่ยอดนิยม'}
          </span>
          <h2 className="text-foreground text-balance text-3xl font-bold tracking-tight md:text-4xl">
            ค้นพบสถานที่ท่องเที่ยวที่ดีที่สุดในไทย
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {destinations.map(dest => (
            <div
              key={dest.title}
              className="bg-card border-border group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="from-foreground/50 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="text-background absolute bottom-3 left-3 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-medium text-white">
                    {dest.location}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-card-foreground mb-1.5 font-semibold">
                  {dest.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {dest.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
