"use client";

import * as React from "react";

import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  disabled = false,
  className,
}: MultiSelectProps) {
  return (
    <Combobox
      items={options}
      multiple
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <ComboboxChips className={className}>
        <ComboboxValue>
          {value.map((item) => {
            const option = options.find((o) => o.value === item);
            return (
              <ComboboxChip key={item}>
                {option?.label ?? item}
              </ComboboxChip>
            );
          })}
        </ComboboxValue>
        <ComboboxChipsInput placeholder={value.length === 0 ? placeholder : ""} />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No options found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
