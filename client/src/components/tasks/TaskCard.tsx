import { useState } from "react";
import type { Task } from "shared";

interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => Promise<void>;
}

function TaskCard({ task, onDelete }: TaskCardProps) {
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div>
      <div>title: {task.title} </div>
      <div>dueDate: {task.dueDate} </div>
      <div>completed?: {task.completed} </div>
      <div>description: {task.description} </div>
      <button title="delete" onClick={handleDelete} disabled={deleting}>
        Delete
      </button>
    </div>
  );
}

export default TaskCard;
