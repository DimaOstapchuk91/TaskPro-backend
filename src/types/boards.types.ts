import { Task } from './task.stypes';

export type Board = {
  id: string;
  owner_id: number;
  title: string;
  icons:
    | 'icon-star'
    | 'icon-container'
    | 'icon-puzzle'
    | 'icon-project'
    | 'icon-colors'
    | 'icon-hexagon'
    | 'icon-lightning'
    | 'icon-loading';
  background: string;
  created_at: string;
  updated_at: string;
};
export type BoardInputCreate = Omit<
  Board,
  'id' | 'created_at' | 'updated_at' | 'owner_id'
>;

export type BoardInputUpdate = Omit<Board, 'id' | 'created_at' | 'updated_at'>;

export interface BoardWithColumnsAndTasks {
  id: number;
  title: string;
  columns: {
    id: number;
    title: string;
    tasks: Task[];
  }[];
}
