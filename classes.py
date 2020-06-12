class Post:
    def __init__(self, channel, username, message, time):
        self.channel = channel
        self.username = username
        self.message = message
        self.time = time

class User:

    def __init__(self, username):
        self.username = username

        counter = 1
        # Keep track of id number.
        self.id = User.counter
        User.counter += 1

        # Keep track of messages
        self.posts = []

    def add_post(self, p):
        self.posts.append(p)
        self.id = p.post_id

class Channel:
    def __init__(self, name):
        self.name = name

        counter = 1
        # Keep track of id number.
        self.id = Channel.counter
        Channel.counter += 1

        # Keep track of messages
        self.posts = []

    def add_post(self, p):
        self.posts.append(p)
        self.id = p.post_id
