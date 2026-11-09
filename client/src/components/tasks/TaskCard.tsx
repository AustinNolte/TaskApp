import { CheckIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
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
    <div className="group flex flex-col gap-4 rounded-xl border border-dark-teal-400 bg-dark-teal-200 p-5 shadow-lg transition hover:-translate-y-0.5 hover:border-dark-cyan-500 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <span
          className={`text-base font-semibold text-vanilla-custard-400 ${task.completed ? "line-through opacity-50" : ""}`}
        >
          {task.title}
        </span>
        <span className="text-xs text-pearl-aqua-600">
          Due{" "}
          {new Date(task.dueDate).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          title="Toggle Complete"
          onClick={handleToggle}
          disabled={toggling}
          className="flex items-center gap-1.5 rounded-md border border-pearl-aqua-600/50 px-2.5 py-1.5 text-xs text-pearl-aqua-800 hover:bg-pearl-aqua-600/25 hover:text-pearl-aqua-900 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
        >
          <CheckIcon className="size-4" />
          {task.completed ? "Completed" : "Complete"}
        </button>
        <button
          title="Edit Task"
          onClick={handleEdit}
          className="flex items-center gap-1.5 rounded-md border border-pearl-aqua-600/50 px-2.5 py-1.5 text-xs text-pearl-aqua-800 hover:bg-pearl-aqua-600/25 hover:text-pearl-aqua-900 transition-colors"
        >
          <PencilSquareIcon className="size-4" />
          Edit
        </button>
        <button
          title="Delete Task"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 rounded-md border border-brown-red-600/50 px-2.5 py-1.5 text-xs text-brown-red-700 hover:bg-brown-red-600/25 hover:text-brown-red-900 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
        >
          <TrashIcon className="size-4" />
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
