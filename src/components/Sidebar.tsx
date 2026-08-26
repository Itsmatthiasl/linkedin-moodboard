"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewBoardForm } from "@/components/NewBoardForm";
import type { Board } from "@/lib/types";

export function Sidebar({ boards }: { boards: Board[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden h-full w-56 shrink-0 flex-col gap-4 border-r border-neutral-200 p-4 md:flex dark:border-neutral-800">
      <Link href="/boards" className="text-sm font-semibold tracking-tight">
        Moodboard
      </Link>
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {boards.map((board) => {
          const href = `/boards/${board.id}`;
          const active = pathname === href;
          return (
            <Link
              key={board.id}
              href={href}
              className={`truncate rounded-md px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              }`}
            >
              {board.name}
            </Link>
          );
        })}
      </div>
      <NewBoardForm />
    </nav>
  );
}
