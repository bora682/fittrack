from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token

from config import Config
from models import db, bcrypt, User


app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)
bcrypt.init_app(app)
Migrate(app, db)
JWTManager(app)


@app.get("/")
def home():
    return jsonify({"message": "FitTrack API is running"}), 200


@app.post("/api/signup")
def signup():
    data = request.get_json()

    try:
        new_user = User(
            username=data["username"],
            email=data["email"]
        )
        new_user.password_hash = data["password"]

        db.session.add(new_user)
        db.session.commit()

        token = create_access_token(identity=str(new_user.id))

        return {
            "user": new_user.to_dict(),
            "token": token
        }, 201

    except Exception as e:
        return {"error": str(e)}, 400


@app.post("/api/login")
def login():
    data = request.get_json()

    user = User.query.filter_by(email=data["email"]).first()

    if user and user.authenticate(data["password"]):
        token = create_access_token(identity=str(user.id))

        return {
            "user": user.to_dict(),
            "token": token
        }, 200

    return {"error": "Invalid credentials"}, 401


if __name__ == "__main__":
    app.run(port=5555, debug=True)