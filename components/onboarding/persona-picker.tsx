"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  PERSONA_DESCRIPTIONS,
  PERSONA_LABELS,
  PERSONA_TYPES,
  type PersonaType,
} from "@/lib/personas/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PersonaPickerProps = {
  value: PersonaType | null;
  customValue: string;
  onChange: (persona: PersonaType | null, custom: string) => void;
};

export function PersonaPicker({
  value,
  customValue,
  onChange,
}: PersonaPickerProps) {
  const [otherText, setOtherText] = useState(customValue);

  function select(persona: PersonaType) {
    if (persona === "other") {
      onChange("other", otherText);
    } else {
      onChange(persona, "");
    }
  }

  return (
    <div className="space-y-4">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">
          What best describes you?
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PERSONA_TYPES.map((persona) => {
            const selected = value === persona;
            const description =
              persona !== "other" ? PERSONA_DESCRIPTIONS[persona] : null;
            return (
              <label
                key={persona}
                className={cn(
                  "flex cursor-pointer flex-col rounded-xl border px-4 py-3 text-left shadow-pill transition-colors",
                  selected
                    ? "border-brand bg-brand/5 ring-1 ring-brand"
                    : "border-border/60 bg-card hover:bg-card/80",
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="personaType"
                    value={persona}
                    checked={selected}
                    onChange={() => select(persona)}
                    className="accent-brand"
                  />
                  <span className="font-heading text-sm font-semibold">
                    {PERSONA_LABELS[persona]}
                  </span>
                </span>
                {description ? (
                  <span className="mt-1.5 pl-6 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </span>
                ) : (
                  <span className="mt-1.5 pl-6 text-xs text-muted-foreground">
                    Something else - describe in your own words
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {value === "other" ? (
        <div className="space-y-2">
          <Label htmlFor="personaCustom">Describe yourself</Label>
          <Input
            id="personaCustom"
            value={otherText}
            onChange={(e) => {
              setOtherText(e.target.value);
              onChange("other", e.target.value);
            }}
            placeholder="e.g. healthcare policy analyst, indie game dev, lawyer"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            Used to tailor discovery topics and your profile prompt.
          </p>
        </div>
      ) : null}
    </div>
  );
}
