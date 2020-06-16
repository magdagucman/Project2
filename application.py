import os
import requests
import datetime


from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit
from classes import *

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


# Store users, channels and posts as global variables
users = []
channels = ["Dogs", "Cats"]
posts = []

@app.route("/")
def index():
    return render_template("index.html", channels=channels, posts=posts)

@app.route("/<string:channel>")
def channel(channel):
    return channel


@app.route("/add_user", methods=["POST"])
def add_user():
    username = request.form.get("username")
    if username in users:
        return jsonify({"success": False})
    users.append(username)
    return jsonify({"success": True, "username": username})


@app.route("/get_channel", methods=["GET"])
def get_channel():
    return jsonify({"success": True, "channels": channels})


@socketio.on("add channel")
def add_channel(data):
    selection = data["selection"].capitalize()
    channels.append(selection)
    emit("display channel", {"selection": selection}, broadcast=True)

@socketio.on("add post")
def add_post(data):
    post = Post(channel=data["selection"][0], username=data["selection"][1], message=data["selection"][2], time=datetime.datetime.now())
    posts.append(post)
    selection = data["selection"]
    emit("display post", {"selection": selection}, broadcast=True)
