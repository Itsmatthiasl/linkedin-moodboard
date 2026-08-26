import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewBoardForm } from "@/components/NewBoardForm";
import type { Board } from "@/lib/types";

export default async function BoardsIndexPage() {
  const supabase = await createClient();
  const { data: boards } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: true });

  const boardList = (boards ?? []) as Board[];

  if (boardList.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div>
          <h1 className="text-lg font-semibold">Create your first board</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Boards are where you collect LinkedIn posts for inspiration.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <NewBoardForm />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Boards</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {boardList.map((board) => (
          <Link
            key={board.id}
            href={`/boards/${board.id}`}
            className="rounded-lg border border-neutral-200 p-4 text-sm font-medium transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
          >
            {board.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
