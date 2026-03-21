"use client";

import { useApp } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ROUTES } from "@/lib/constants/routes";
import { goBack } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const { questions } = useApp();
  const [aggressiveness, setAggressiveness] = useState(1);
  const [multiSelectValues, setMultiSelectValues] = useState<
    Record<string, string[]>
  >({});

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="space-y-12">
      <h1 className="text-xl">Let&apos;s understand your offering better</h1>
      <form className="space-y-8" onSubmit={handleFormSubmit}>
        <fieldset className="space-y-3">
          <Label>Set preferred creativity level</Label>
          <Slider
            value={aggressiveness}
            max={2}
            step={1}
            min={0}
            onValueChange={(a) => setAggressiveness(Number(a))}
          />
          <div className="flex justify-between">
            {["Safe", "Balanced", "Aggressive"].map((a, index) => (
              <small
                key={a}
                onClick={() => setAggressiveness(index)}
                className={`transition-colors cursor-pointer ${aggressiveness > index - 1 || index === 0 ? "" : "text-accent-foreground/50"}`}
              >
                {a}
              </small>
            ))}
          </div>
        </fieldset>
        {questions.map((q) => (
          <fieldset key={q.key} className="space-y-2">
            <Label className="text-md">{q.question}</Label>
            {q.type === "single_select" && (
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {q.options?.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            {q.type === "number" && <Input type={q.type} className="w-full" />}
            {q.type === "multi_select" && q.options && (
              <MultiSelect
                options={q.options.map((o) => ({ label: o, value: o }))}
                value={multiSelectValues[q.key] || []}
                onValueChange={(val) =>
                  setMultiSelectValues((prev) => ({ ...prev, [q.key]: val }))
                }
                placeholder="Select options..."
                className="w-full"
              />
            )}
          </fieldset>
        ))}
        <div className="flex gap-4 justify-end mt-10">
          <Button type="button" variant="ghost" onClick={goBack}>
            Go back
          </Button>
          <Button
            type="submit"
            onClick={() => router.push(ROUTES.onboarding.questions)}
          >
            Continue
            <ChevronRight className="opacity-50" />
          </Button>
        </div>
      </form>
    </div>
  );
}
