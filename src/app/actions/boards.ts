"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NEW_BOARD_VALUE } from "@/lib/constants";

export type ActionState = { error?: string } | undefined;

export async function createBoard(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Board name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("boards")
    .insert({ name, user_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Could not create board." };
  }

  revalidatePath("/boards");
  redirect(`/boards/${data.id}`);
}

export type AddPostState = { error?: string } | undefined;

export async function addPost(
  _prevState: AddPostState,
  formData: FormData
): Promise<AddPostState> {
  const linkedinUrl = String(formData.get("linkedin_url") ?? "").trim();
  const authorName = String(formData.get("author_name") ?? "").trim();
  const postText = String(formData.get("post_text") ?? "").trim();
  const engagementSummary = String(
    formData.get("engagement_summary") ?? ""
  ).trim();
  const boardSelection = String(formData.get("board_id") ?? "");
  const newBoardName = String(formData.get("new_board_name") ?? "").trim();

  if (!linkedinUrl || !authorName || !postText) {
    return { error: "URL, author name, and post text are required." };
  }
  if (boardSelection === NEW_BOARD_VALUE && !newBoardName) {
    return { error: "Enter a name for the new board." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let boardId = boardSelection;

  if (boardSelection === NEW_BOARD_VALUE) {
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .insert({ name: newBoardName, user_id: user.id })
      .select("id")
      .single();

    if (boardError || !board) {
      return { error: "Could not create board." };
    }
    boardId = board.id;
  }

  const { error: postError } = await supabase.from("posts").insert({
    board_id: boardId,
    linkedin_url: linkedinUrl,
    author_name: authorName,
    post_text: postText,
    engagement_summary: engagementSummary || null,
  });

  if (postError) {
    return { error: "Could not save post." };
  }

  revalidatePath("/boards");
  revalidatePath(`/boards/${boardId}`);
  redirect(`/boards/${boardId}`);
}

export async function removePost(postId: string, boardId: string) {
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", postId);
  revalidatePath(`/boards/${boardId}`);
}
