import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Balancer } from "react-wrap-balancer";

export default function Home() {
  return (
    <div className="w-screen px-5 h-screen flex justify-center items-center">
      <div className="w-full h-full flex-col gap-6 flex items-center justify-center">
        <h1 className="text-3xl leading-10 md:text-5xl md:leading-14 max-w-167.5 text-center capitalize font-medium">
          <Balancer>Find customers who already need what you offer</Balancer>
        </h1>
        <p className="max-w-150 text-accent-foreground md:text-xl text-center">
          <Balancer>
            We scan real-time signals across the internet and tell you exactly
            who to target, what to say, and when to act.
          </Balancer>
        </p>
        <Link href={ROUTES.chat}>
          <Button size="lg" className="scale-110">
            <PlusIcon className="opacity-50" />
            Get Started
            <PlusIcon className="opacity-50" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
