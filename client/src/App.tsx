import { useNavigate } from "react-router";
import AuthButton from "./components/auth/AuthButtons";
import type { AuthTypes } from "./types/auth";
import { useAuth } from "./auth/AuthContext";
import type { Task } from "shared";
import "./App.css";
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
    console.log("here");
    setTasks((prev) => [...prev, t]);
    setShowTaskForm(false);
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
      <div>
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
    <div>
      <div>
        {tasks.length > 0 &&
          tasks.map((task) => <TaskCard task={task} key={task.id} onDelete={handleTaskDelete} />)}
      </div>
      <div>
        <button onClick={() => setShowTaskForm(true)} disabled={showTaskForm}>
          Create Task
        </button>
      </div>
      {showTaskForm && (
        <div className="overlay">
          <div className="card">
            <TaskForm onAddTask={handleAddTask} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
