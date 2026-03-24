import ChatSimulation from "@/components/landing/chat-simulation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import Link from "next/link";
import Balancer from "react-wrap-balancer";

export default function Home() {
  return (
    <div className="container max-w-325 mx-auto px-5">
      <header className="h-17.5">
        <div className="flex items-center h-full justify-between">
          <Logo />
          <ul className="md:flex items-center hidden gap-6">
            {[
              { label: "Pricing", route: "#" },
              { label: "Enterprise", route: "#" },
            ].map((item) => (
              <li key={item.label}>
                <Link href={item.route}>{item.label}</Link>
              </li>
            ))}
            <Link href={ROUTES.chat}>
              <Button>Get started</Button>
            </Link>
          </ul>
        </div>
      </header>

      <section className="md:h-screen">
        <div className="h-full flex pt-7 flex-col">
          <div className="space-y-4">
            <h1 className="md:text-[3.6rem] text-3xl font-serif">
              <Balancer>Your second opinion on getting customers.</Balancer>
            </h1>
            <p className="max-w-3xl text-accent-foreground">
              <Balancer>
                Second analyzes your business, reads real-world demand signals,
                and delivers specific, execution-ready strategies. Not generic
                advice. A focused plan for who to target, what to say, and when
                to act.
              </Balancer>
            </p>
            <div className="flex items-center gap-4">
              <Link href={ROUTES.chat}>
                <Button>Get started</Button>
              </Link>
              <Button variant="ghost">See it in action</Button>
            </div>
          </div>
          <ChatSimulation />
        </div>
      </section>

      <section className="md:h-screen md:flex py-44 md:py-0 items-center justify-center">
        <div className="space-y-20 w-full">
          <h1 className="md:text-[3.6rem] text-center text-3xl font-serif">
            <Balancer>
              ChatGPT is a generalist.
              <br />
              Second is your growth specialist.
            </Balancer>
          </h1>
          <div className="flex flex-col w-full max-w-250 md:flex-row mx-auto">
            <div className="flex-1 bg-neutral-100 space-y-3 p-8">
              <h3 className="text-accent-foreground font-medium">
                ChatGPT, Gemini, Claude, etc
              </h3>
              <ul className="space-y-2">
                {[
                  "Great at everything, specialized in nothing",
                  "You have to know the right questions to ask",
                  "Generic advice with no awareness of your market",
                  "Gives you frameworks, not targets",
                  "No memory of your business between sessions",
                  "Still leaves you figuring out what to actually do",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="size-2 bg-neutral-300" />
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 bg-primary/10 space-y-3 p-8">
              <h3 className="text-accent-foreground font-medium">Second</h3>
              <ul className="space-y-2">
                {[
                  "Built for one thing: getting you customers",
                  "Knows your business, your stage, your context",
                  "Reads live market signals, not just your prompt",
                  "Named targets, exact messaging, clear sequence",
                  "Remembers what you've tried and what's worked",
                  "Tells you what to do next, not what to consider",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="size-2 bg-primary" />
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t md:flex py-32 -mt-20 items-center justify-center">
        <div className="space-y-20 w-full">
          <div className="text-center">
            <h1 className="md:text-[3.6rem] text-3xl font-serif">Pricing</h1>
            <p className="text-accent-foreground">
              Start small. Scale when you&apos;re ready.
            </p>
          </div>
          <PricingTable />
        </div>
      </section>
    </div>
  );
}

const plans = [
  {
    name: "Starter",
    price: "$5",
    credits: "5000 credits",
  },
  {
    name: "Growth",
    price: "$10",
    credits: "20000 credits",
    highlight: true,
  },
  {
    name: "Scale",
    price: "$50",
    credits: "Unlimited credits",
  },
];

function PricingTable() {
  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border space-y-6 rounded-xl p-6 flex flex-col justify-between transition
              ${
                plan.highlight
                  ? "border-primary shadow-lg scale-[1.02]"
                  : "border-neutral-200"
              }
            `}
          >
            <div className="space-y-3">
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-semibold">{plan.price}</span>
                <span className="text-sm text-neutral-500">/one-time</span>
              </div>
              <p className="text-neutral-600 text-sm">{plan.credits}</p>
            </div>

            <Button variant={plan.highlight ? "default" : "outline"}>
              Get Started
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
