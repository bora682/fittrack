from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)

    workouts = db.relationship(
        "Workout",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    @property
    def password_hash(self):
        raise AttributeError("Password hashes may not be viewed.")

    @password_hash.setter
    def password_hash(self, password):
        self._password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email
        }


class Workout(db.Model):
    __tablename__ = "workouts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    date = db.Column(db.String)
    notes = db.Column(db.Text)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", back_populates="workouts")
    exercise_entries = db.relationship(
        "ExerciseEntry",
        back_populates="workout",
        cascade="all, delete-orphan"
    )

    @validates("title")
    def validate_title(self, key, value):
        if not value or not value.strip():
            raise ValueError("Workout title is required.")
        return value.strip()

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "date": self.date,
            "notes": self.notes,
            "user_id": self.user_id,
            "exercise_entries": [entry.to_dict() for entry in self.exercise_entries]
        }


class ExerciseEntry(db.Model):
    __tablename__ = "exercise_entries"

    id = db.Column(db.Integer, primary_key=True)
    exercise_name = db.Column(db.String, nullable=False)
    sets = db.Column(db.Integer)
    reps = db.Column(db.Integer)
    weight = db.Column(db.String)

    workout_id = db.Column(db.Integer, db.ForeignKey("workouts.id"), nullable=False)

    workout = db.relationship("Workout", back_populates="exercise_entries")

    @validates("exercise_name")
    def validate_exercise_name(self, key, value):
        if not value or not value.strip():
            raise ValueError("Exercise name is required.")
        return value.strip()

    def to_dict(self):
        return {
            "id": self.id,
            "exercise_name": self.exercise_name,
            "sets": self.sets,
            "reps": self.reps,
            "weight": self.weight,
            "workout_id": self.workout_id
        }