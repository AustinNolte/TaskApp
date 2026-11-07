import { useState } from "react";
import type { Task } from "shared";

interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => Promise<void>;
  onToggle: (id: number, c: boolean) => Promise<void>;
  onEdit: (task: Task) => void;
}

function TaskCard({ task, onDelete, onToggle, onEdit }: TaskCardProps) {
  const [deleting, setDeleting] = useState<boolean>(false);
  const [toggling, setToggling] = useState<boolean>(false);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      await onToggle(task.id, task.completed);
    } finally {
      setToggling(false);
    }
  };

  const handleEdit = () => {
    onEdit(task);
  };
  return (
    <div>
      <div>title: {task.title} </div>
      <div>dueDate: {task.dueDate} </div>
      <div>completed?: {task.completed ? "true" : "false"} </div>
      <div>description: {task.description} </div>
      <button title="Delete Task" onClick={handleDelete} disabled={deleting}>
        Delete
      </button>
      <button title="Toggle Complete" onClick={handleToggle} disabled={toggling}>
        Toggle Complete
      </button>
      <button title="Edit Task" onClick={handleEdit}>
        Edit Task
      </button>
    </div>
  );
}

export default TaskCard;
