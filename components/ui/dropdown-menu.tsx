"use client";

import { Menu } from "@base-ui/react/menu";
import { cn } from "@/lib/utils";

const DropdownMenuRoot = Menu.Root;
const DropdownMenuTrigger = Menu.Trigger;
const DropdownMenuPortal = Menu.Portal;
const DropdownMenuPositioner = Menu.Positioner;
const DropdownMenuPopup = Menu.Popup;
const DropdownMenuItem = Menu.Item;
const DropdownMenuSeparator = Menu.Separator;
const DropdownMenuLabel = Menu.GroupLabel;
const DropdownMenuGroup = Menu.Group;

function DropdownMenuContent({
  className,
  children,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithoutRef<typeof Menu.Positioner>) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPositioner sideOffset={sideOffset} className={cn("z-50", className)} {...props}>
        <DropdownMenuPopup>{children}</DropdownMenuPopup>
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  );
}

export {
  DropdownMenuRoot as DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuPopup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
};
