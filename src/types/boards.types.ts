export interface CreateBoardBody {
  title: string;
}

export type Board = {
  id: string;
  owner_id: number;
  title: string;
  created_at: string;
  updated_at: string;
};
