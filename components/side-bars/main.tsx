import { getCurrentUser } from "@/lib/auth";
import { Gift, Hash, PlusIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export function MainSidebar() {
  const [user, setUser] = useState<{
    email?: string;
    user_metadata: {
      name?: string;
      avatar_url?: string;
      given_name?: string;
      family_name?: string;
    };
  } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    fetchUser();
  }, []);

  const displayName =
    user?.user_metadata?.name ||
    [user?.user_metadata?.given_name, user?.user_metadata?.family_name]
      .filter(Boolean)
      .join(" ") ||
    user?.email?.split("@")[0] ||
    "User";

  console.log("user?.user_metadata", user?.user_metadata);

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "tween", duration: 0.2 }}
      className="flex-1 border-r relative flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center border-b px-5 py-3 justify-between">
          <h1 className="font-medium flex items-center gap-1">
            <Hash size={14} />
            second
          </h1>
          <Button>
            <PlusIcon className="opacity-50" />
            New chat
          </Button>
        </div>
        <ul className="p-5">
          {Array.from({ length: 6 }).map((chat, index) => (
            <li
              key={index}
              className="py-2 cursor-pointer text-accent-foreground hover:text-primary"
              role="button"
            >
              <h2 className="text-ellipsis line-clamp-1">
                How to start a profitable business in Ghana
              </h2>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center border-t px-5 h-20 justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <p>{displayName}</p>
        </div>
        <Button variant="outline" className="rounded-full text-primary">
          <Gift />
          Go Pro
        </Button>
      </div>
    </motion.div>
  );
}
