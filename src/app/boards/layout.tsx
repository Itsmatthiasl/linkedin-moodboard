import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { Sidebar } from "@/components/Sidebar";
import { AddPostModal } from "@/components/AddPostModal";
import type { Board } from "@/lib/types";

export default async function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: boards } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: true });

  const boardList = (boards ?? []) as Board[];

  return (
    <div className="flex min-h-screen">
      <Sidebar boards={boardList} />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <Link
              href="/boards"
              className="text-sm font-semibold tracking-tight md:hidden"
            >
              Moodboard
            </Link>
            <span className="hidden text-sm text-neutral-500 sm:inline">
              {user.email}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <AddPostModal boards={boardList} />
            <form action={logout}>
              <button className="text-sm text-neutral-500 hover:underline">
                Log out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
