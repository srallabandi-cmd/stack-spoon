import Image from "next/image";
import Link from "next/link";

export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/brand/mark.svg"
      alt="Stack Spoon"
      width={size}
      height={size}
      priority
      className="brand-mark"
    />
  );
}

export function BrandLockup({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="brand-lockup">
      <BrandMark size={32} />
      <span className="brand-word">Stack Spoon</span>
    </Link>
  );
}
