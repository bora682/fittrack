import { useEffect, useState } from "react";

function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const [exerciseForms, setExerciseForms] = useState({});

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  useEffect(() => {
    async function fetchWorkouts() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your workouts.");
        setLoading(false);
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
          setLoading(false);
          return;
        }

        setWorkouts(data);
      } catch (err) {
        setError("Something went wrong while loading workouts.");
      } finally {
        setLoading(false);
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

  async function handleDeleteWorkout(id) {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://127.0.0.1:5555/api/workouts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete workout");
        return;
      }

      setWorkouts(workouts.filter((workout) => workout.id !== id));
    } catch (err) {
      setError("Something went wrong");
    }
  }

  function handleExerciseChange(workoutId, e) {
    setExerciseForms({
      ...exerciseForms,
      [workoutId]: {
        ...exerciseForms[workoutId],
        [e.target.name]: e.target.value,
      },
    });
  }

  async function handleAddExercise(workoutId, e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const exerciseData = exerciseForms[workoutId] || {
      exercise_name: "",
      sets: "",
      reps: "",
      weight: "",
    };

    try {
      const res = await fetch(
        `http://127.0.0.1:5555/api/workouts/${workoutId}/exercises`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(exerciseData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add exercise");
        return;
      }

      const updatedWorkouts = workouts.map((workout) => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercise_entries: [...workout.exercise_entries, data],
          };
        }
        return workout;
      });

      setWorkouts(updatedWorkouts);

      setExerciseForms({
        ...exerciseForms,
        [workoutId]: {
          exercise_name: "",
          sets: "",
          reps: "",
          weight: "",
        },
      });
    } catch (err) {
      setError("Something went wrong");
    }
  }

  async function handleDeleteExercise(workoutId, exerciseId) {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://127.0.0.1:5555/api/exercises/${exerciseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete exercise");
        return;
      }

      const updatedWorkouts = workouts.map((workout) => {
        if (workout.id === workoutId) {
          return {
            ...workout,
            exercise_entries: workout.exercise_entries.filter(
              (exercise) => exercise.id !== exerciseId
            ),
          };
        }
        return workout;
      });

      setWorkouts(updatedWorkouts);
    } catch (err) {
      setError("Something went wrong");
    }
  }

  return (
    <div>
      <h2>Dashboard</h2>

      <button onClick={handleLogout}>Logout</button>

      {loading && <p>Loading workouts...</p>}

      {!loading && (
        <>
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

          {!error && workouts.length === 0 && (
            <p>No workouts yet. Add your first workout above 💪</p>
          )}

          {workouts.map((workout) => {
            const currentExerciseForm = exerciseForms[workout.id] || {
              exercise_name: "",
              sets: "",
              reps: "",
              weight: "",
            };

            return (
              <div key={workout.id}>
                <h3>{workout.title}</h3>
                <p>Date: {workout.date}</p>
                <p>Notes: {workout.notes}</p>

                <button onClick={() => handleDeleteWorkout(workout.id)}>
                  Delete Workout
                </button>

                <h4>Exercises</h4>

                {workout.exercise_entries.length === 0 && (
                  <p>No exercises yet.</p>
                )}

                {workout.exercise_entries.map((exercise) => (
                  <div key={exercise.id}>
                    <p>
                      {exercise.exercise_name} — {exercise.sets} sets ×{" "}
                      {exercise.reps} reps
                      {exercise.weight && ` @ ${exercise.weight} lbs`}
                    </p>

                    <button
                      onClick={() =>
                        handleDeleteExercise(workout.id, exercise.id)
                      }
                    >
                      Delete Exercise
                    </button>
                  </div>
                ))}

                <form onSubmit={(e) => handleAddExercise(workout.id, e)}>
                  <input
                    type="text"
                    name="exercise_name"
                    placeholder="Exercise name"
                    value={currentExerciseForm.exercise_name}
                    onChange={(e) => handleExerciseChange(workout.id, e)}
                  />

                  <input
                    type="number"
                    name="sets"
                    placeholder="Sets"
                    value={currentExerciseForm.sets}
                    onChange={(e) => handleExerciseChange(workout.id, e)}
                  />

                  <input
                    type="number"
                    name="reps"
                    placeholder="Reps"
                    value={currentExerciseForm.reps}
                    onChange={(e) => handleExerciseChange(workout.id, e)}
                  />

                  <input
                    type="text"
                    name="weight"
                    placeholder="Weight"
                    value={currentExerciseForm.weight}
                    onChange={(e) => handleExerciseChange(workout.id, e)}
                  />

                  <button type="submit">Add Exercise</button>
                </form>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default Dashboard;