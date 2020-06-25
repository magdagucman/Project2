# Project 2

Web Programming with Python and JavaScript

This single-page web application allows users for live communication on different channels. As per the specifications, user has to provide a username first (has to be unique, only alphanumerics allowed), which is then stored in local storage, as well as in global variable - a list of users in application.py. User can then choose the channel he would like to use from the list or create his own, as long as its name is unique. If user decides to create own channel and succeeds, it will appear on the list of channels live, using a socket. It will also be added to be stored in a list of channels in application.py. When user opens a channel, he will see all the posts that have already been created. The application stores a hundred posts per channel - should the number of post exceed this number, the oldest post will be removed, and the newest will be appended at the end of the list. If number of posts is big enough to overflow the div that contains them, upon opening of the channel, the user will see the posts scrolled down to the newest one. After adding a new post, the page will also automatically scroll down to show it to its author (but not other users connected to socket). Each post contains username, date and time, as well as the message itself, and is displayed only within the proper channel. After clicking on send icon or pressing enter, the post will be visible to all the users (no need to reload the page). It will also be stored in a list of posts associated with a proper channel in application.py. If user closes the page while visiting one of the channels, this channel will be saved in local storage and displayed upon opening the page again.

Personal touch: users are able to delete their own posts. Clicking delete button will trigger sending data with the use of AJAX (the change will not be visible live to other users, only after reloading) as well as CSS animation that hides and removes the proper element. If user tries to delete someone else's message, nothing will happen.

Files within application:
  application.py contains code for application

  classes.py defines classes:
                a) Post (allowing to associate channel, username, message and time with each post),
                b) Channel (allowing to associate a list of Posts with each channel)


  Templates:
    index.html - a dynamic template for the application

  Static:
    chat.ico is an icon for the application

    send.svg icon used instead of send button

    styles.css/styles.scss are stylesheets for the application

    index.js contains JavaScript code for the application
