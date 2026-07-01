"use client";

import { useState } from "react";
import Image from "next/image";
import { Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export function Header() {
  const { user } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Logo className="h-5 w-5 text-ink" strokeWidth={9} />
          <div className="leading-tight">
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.1em] text-ink">
              Tally
            </p>
            <p className="tabular-nums text-xs text-ink-faint">
              {dateFormatter.format(new Date())}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <IconButton aria-label="Open settings" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
          </IconButton>
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full border border-line"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-medium text-accent">
              {user?.displayName?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>
      </header>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
        <SettingsPanel />
      </Modal>
    </>
  );
}
