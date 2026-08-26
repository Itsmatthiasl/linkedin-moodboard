import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoardGrid } from "@/components/BoardGrid";
import type { Post } from "@/lib/types";

const PAGE_SIZE = 12;

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", id)
    .single();

  if (!board) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("board_id", id)
    .order("saved_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  const postList = (posts ?? []) as Post[];

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">{board.name}</h1>
      <BoardGrid
        boardId={id}
        initialPosts={postList}
        initialHasMore={postList.length === PAGE_SIZE}
      />
    </div>
  );
}
