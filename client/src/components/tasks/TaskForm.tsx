import React, { useState } from "react";
import type { Task } from "shared";

interface TaskFormProps {
  onAddTask: (t: Task) => Promise<void>;
  onUpdateTask: (t: Task) => Promise<void>;
  onClose: () => void;
  task: Task | null;
}

const formatLocalDate = (iso: string) => {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function TaskForm({ onAddTask, onUpdateTask, onClose, task }: TaskFormProps) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    dueDate: task ? formatLocalDate(task.dueDate) : "",
  });
  const isEdit = task !== null;

  const onSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        const diff: { title?: string; description?: string; dueDate?: string } = {};
        if (formData.title !== task.title) diff.title = formData.title;
        if (formData.description !== task.description) diff.description = formData.description;
        if (formData.dueDate !== formatLocalDate(task.dueDate)) diff.dueDate = formData.dueDate;

        if (Object.keys(diff).length === 0) {
          onClose();
          return;
        }

        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(diff),
        });
        const data = await response.json();
        if (response.ok) {
          await onUpdateTask(data.task);
        } else {
          setError(data.error);
        }
      } else {
        const body =
          formData.dueDate === ""
            ? { title: formData.title, description: formData.description }
            : formData;

        const response = await fetch("/api/tasks/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (response.ok) {
          await onAddTask(data.task);
        } else {
          setError(data.error);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="title"> Title: </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter Title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="description"> Description: </label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Enter description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="dueDate"> Due Date: </label>
          <input
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            placeholder="Enter due date (defauts to 7 days from now if left empty)"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={submitting}>
          Submit
        </button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}

export default TaskForm;
