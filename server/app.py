from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

from config import Config
from models import db, bcrypt


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


if __name__ == "__main__":
    app.run(port=5555, debug=True)