import { useEffect, useState } from "react";

function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    async function fetchWorkouts() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your workouts.");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:5555/api/workouts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || data.msg || "Failed to load workouts");
          return;
        }

        setWorkouts(data);
      } catch (err) {
        setError("Something went wrong while loading workouts.");
      }
    }

    fetchWorkouts();
  }, []);

  async function handleAddWorkout(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:5555/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          date: new Date().toISOString(),
          notes: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add workout");
        return;
      }

      setWorkouts([...workouts, data]);

      setTitle("");
    } catch (err) {
      setError("Something went wrong");
    }
  }

  return (
    <div>
      <h2>Dashboard</h2>

      <form onSubmit={handleAddWorkout}>
        <input
          type="text"
          placeholder="Workout title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add Workout</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!error && workouts.length === 0 && <p>No workouts yet.</p>}

      {workouts.map((workout) => (
        <div key={workout.id}>
          <h3>{workout.title}</h3>
          <p>Date: {workout.date}</p>
          <p>Notes: {workout.notes}</p>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;