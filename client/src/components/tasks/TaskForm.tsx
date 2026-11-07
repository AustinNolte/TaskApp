import React, { useState } from "react";
import type { Task } from "shared";

interface TaskFormProps {
  onAddTask: (t: Task) => Promise<void>;
}

function TaskForm({ onAddTask }: TaskFormProps) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const handleOnSubmit = async (t: Task) => {
    try {
      await onAddTask(t);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    console.log("here in onSubmit");

    const bodyData = { title: "", description: "" };
    if (formData.dueDate === "") {
      bodyData.title = formData.title;
      bodyData.description = formData.description;
    }

    const response = await fetch("/api/tasks/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData.dueDate === "" ? bodyData : formData),
    });
    const data = await response.json();
    if (response.ok) {
      const t: Task = data.task;
      handleOnSubmit(t);
      setError(null);
    } else {
      setError(data.error);
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
          <label htmlFor="description"> description: </label>
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
