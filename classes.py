class Post:
    def __init__(self, channel, username, message, time):
        self.channel = channel
        self.username = username
        self.message = message
        self.time = time

class Channel:
    counter = 1
    def __init__(self, name):
        self.name = name

        # Keep track of id number.
        self.id = Channel.counter
        Channel.counter += 1

        # Keep track of messages
        self.posts = []
