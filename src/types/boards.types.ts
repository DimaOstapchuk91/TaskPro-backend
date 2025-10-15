import { Task } from './task.stypes';

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

export interface BoardWithColumnsAndTasks {
  id: number;
  title: string;
  columns: {
    id: number;
    title: string;
    tasks: Task[];
  }[];
}
