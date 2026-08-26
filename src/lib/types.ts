export type Board = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Post = {
  id: string;
  board_id: string;
  linkedin_url: string;
  author_name: string;
  author_photo_url: string | null;
  post_text: string;
  engagement_summary: string | null;
  saved_at: string;
};
