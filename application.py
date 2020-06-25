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


# Store users and channels as global variables
users = []
channels = []

# Append first two channels
channels.append(Channel(name="Dogs"))
channels.append(Channel(name="Cats"))

@app.route("/")
def index():
    return render_template("index.html", channels=channels)

@app.route("/delete", methods=['POST'])
def delete():
    delete_channel = request.form.get("delete_channel")
    delete_username = request.form.get("delete_username")
    delete_post = request.form.get("delete_post")

    # Iterate through channels
    for channel in channels:

        # When right channel is found, iterate through its posts
        if channel.name == delete_channel:
            for post in channel.posts:

                # If username and message match the deleted by user, remove the whole post
                if post.message == delete_post and post.username == delete_username:
                    channel.posts.remove(post)
                    return jsonify({"success": True})
    return jsonify({"success": False})

@app.route("/<string:name>")
def channel(name):
    posts_list = []
    # Iterate through channels
    for channel in channels:
        if channel.name == name:

            # When right channel is found, iterate through posts
            for post in channel.posts:

                # Append each post to post list
                posts_list.append([post.username, post.message, post.time])
    return jsonify({"channel": name, "posts": posts_list})


@app.route("/add_user", methods=["POST"])
def add_user():
    username = request.form.get("username")

    # If username is taken, return False
    if username in users:
        return jsonify({"success": False})

    # If username is free to take, append it to users list and return True
    users.append(username)
    return jsonify({"success": True, "username": username})


@app.route("/get_channel", methods=["GET"])
def get_channel():
    channel_list = []

    # Iterate through channels and append each one to channel list
    for channel in channels:
        channel_list.append(channel.name)
    return jsonify({"success": True, "channels": channel_list})

# Add newly created channels in real time
@socketio.on("add channel")
def add_channel(data):
    selection = data["selection"].capitalize()
    channel = Channel(name=selection)
    channels.append(channel)
    emit("display channel", {"selection": selection}, broadcast=True)

# Add newly created posts in real time
@socketio.on("add post")
def add_post(data):
    post = Post(channel=data["selection"][0], username=data["selection"][1], message=data["selection"][2], time=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    for channel in channels:

        # If there are less than 100 posts per channel, append post
        if channel.name == data["selection"][0] and len(channel.posts) < 100:
            channel.posts.append(post)

        # If there are more than 100 posts per channel, first remove the oldest post, and then append the newest
        elif channel.name == data["selection"][0] and len(channel.posts) >= 100:
            channel.posts.pop(0)
            channel.posts.append(post)

    selection = [post.username, post.message, post.time, post.channel]
    emit("display post", {"selection": selection}, broadcast=True)
