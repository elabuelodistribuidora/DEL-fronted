import Image from 'next/image'
import Link from 'next/link'

type Props = {
  variant?: 'dark' | 'light'
}

export function Logo({ variant = 'dark' }: Props) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <div className="size-8 overflow-hidden rounded-md">
        <Image
          src="/logo-abuelo.png"
          alt="El Abuelo"
          width={32}
          height={32}
          className="size-full object-contain"
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`text-[10px] font-medium uppercase tracking-widest ${
          variant === 'light' ? 'text-primary-foreground/60' : 'text-muted-foreground'
        }`}>
          Distribuidora
        </span>
        <span className={`text-base font-bold leading-tight ${
          variant === 'light' ? 'text-primary-foreground' : 'text-foreground'
        }`}>
          El Abuelo
        </span>
      </div>
    </Link>
  )
}