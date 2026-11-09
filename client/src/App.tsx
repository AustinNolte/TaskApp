import { useNavigate } from "react-router";
import AuthButton from "./components/auth/AuthButtons";
import type { AuthTypes } from "./types/auth";
import { useAuth } from "./auth/AuthContext";
import type { Task } from "shared";
import { useEffect, useState } from "react";
import TaskCard from "./components/tasks/TaskCard";
import TaskForm from "./components/tasks/TaskForm";

function App() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleTaskToggle = async (id: number, c: boolean) => {
    const response = await fetch(`/api/tasks/${id}`, {
      credentials: "include",
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !c }),
    });
    const data = await response.json();
    if (response.ok) {
      setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
      setError(null);
    } else {
      setError(data.error);
    }
  };

  const handleTaskDelete = async (id: number) => {
    const response = await fetch(`/api/tasks/${id}`, {
      credentials: "include",
      method: "DELETE",
    });
    if (response.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setError(null);
    } else {
      const data = await response.json();
      setError(data.error);
    }
  };

  const handleAddTask = async (t: Task) => {
    setTasks((prev) => [...prev, t]);
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleUpdateTask = async (t: Task) => {
    setTasks((prev) => prev.map((x) => (x.id === t.id ? t : x)));
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const closeTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const loadTasks = async () => {
    if (taskLoading) return;
    setTaskLoading(true);
    try {
      const response = await fetch("/api/tasks/", { credentials: "include", method: "GET" });
      const data = await response.json();
      if (response.ok) {
        setTasks(data.tasks);
        setError(null);
      } else {
        setError(data.error);
      }
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadTasks();
  }, [user]);

  const authButtons: { label: AuthTypes; onClick: () => void }[] = [
    { label: "login", onClick: () => navigate("/auth/login") },
    { label: "sign-up", onClick: () => navigate("/auth/signup") },
  ];

  if (loading) return <p>Loading...</p>;

  if (!user)
    return (
      <div className="flex items-center gap-2 w-full justify-center">
        {authButtons.map((btn) => (
          <AuthButton key={btn.label} label={btn.label} onClick={btn.onClick} />
        ))}
      </div>
    );
  if (error) {
    return <div>{error} </div>;
  }
  if (taskLoading) {
    return <div>fetching tasks! </div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        {error && <p className="text-sm text-brown-red-700">{error}</p>}
        {taskLoading && <p className="text-sm text-pearl-aqua-600">fetching tasks...</p>}
        <button
          onClick={() => {
            setEditingTask(null);
            setShowTaskForm(true);
          }}
          disabled={showTaskForm}
          className="ml-auto flex items-center gap-2 rounded-lg bg-pearl-aqua-500 px-4 py-2 text-sm font-semibold text-ink-black-400 shadow-md hover:bg-pearl-aqua-400 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 transition"
        >
          + Create Task
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {tasks.length > 0 &&
          tasks.map((task) => (
            <TaskCard
              task={task}
              key={task.id}
              onDelete={handleTaskDelete}
              onToggle={handleTaskToggle}
              onEdit={handleEditTask}
            />
          ))}
      </div>
      {showTaskForm && (
        <div className="overlay">
          <div className="card">
            <TaskForm
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onClose={closeTaskForm}
              task={editingTask}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
