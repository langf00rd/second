import Link from "next/link";

export function Logo() {
  return (
    <Link href="/">
      <h1 className="text-2xl font-medium flex items-center gap-1 font-serif">
        <div className="size-4 bg-primary" />
        second
      </h1>
    </Link>
  );
}
