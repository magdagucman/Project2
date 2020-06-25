var username;
var current_channel;

// If user submitted the display name in the past
if (localStorage.getItem('username')) {

  // If user's last channel in local storage
  if (localStorage.getItem('channel')) {

    // Set username
    username = localStorage.getItem('username');

    // Set current channel
    current_channel = localStorage.getItem('channel');

    // Load the DOM
    document.addEventListener('DOMContentLoaded', () => {

        // Set up web socket
        var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

        // Add username div
        const template = Handlebars.compile(document.querySelector('#handleuser').innerHTML);
        const content = template({'username': username});
        document.querySelector('#userdiv').innerHTML += content;


        // Load channel page
        load_page(localStorage.getItem('channel'))
        document.querySelector('#firstpage').remove();

        // By default, post button is disabled
        document.querySelector('.chatbutton').disabled = true;

        // Enable button only if there is text in the input field
        document.querySelector('.chatmessage').onkeyup = () => {
            if (document.querySelector('.chatmessage').value.length > 0 && isNotSpace(document.querySelector('.chatmessage').value))
                document.querySelector('.chatbutton').disabled = false;
            else
                document.querySelector('.chatbutton').disabled = true;
          }

        add_channels();
        goToChannel();
    });
  }

// If last visited channel not in local storage
else {
    // Fetch username from local storage
    username = localStorage.getItem('username');

    // Load the DOM
    document.addEventListener('DOMContentLoaded', () => {

        // Set up the web socket
        var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

        document.querySelector('#firstpage').remove();

        // Generate welcome page
        document.querySelector('#welcome').innerHTML = `<h1>Choose a channel to start</h1>`;
        document.querySelector('#chat').hidden = true;
        const template = Handlebars.compile(document.querySelector('#handleuser').innerHTML);
        const content = template({'username': username});
        document.querySelector('#userdiv').innerHTML += content;


        // By default, post button is disabled
        document.querySelector('.chatbutton').disabled = true;

        // Enable button only if there is text in the input field
        document.querySelector('.chatmessage').onkeyup = () => {
            if (document.querySelector('.chatmessage').value.length > 0 && isNotSpace(document.querySelector('.chatmessage').value))
                document.querySelector('.chatbutton').disabled = false;
            else
                document.querySelector('.chatbutton').disabled = true;
          }

        add_channels();
        goToChannel();
      });
    }
  }

// If user visiting for the first time
else {
      document.addEventListener('DOMContentLoaded', () => {

      // By default, submit form for creating new channels is hidden
      document.querySelector('#channeldiv').hidden = true;

      // By default, submit button for creating username is disabled
      document.querySelector('#namebutton').disabled = true;

      // Enable button only if there is text in the input field
      document.querySelector('#username').onkeyup = () => {
          if (document.querySelector('#username').value.length > 0 && isAlnum(document.querySelector('#username').value) && isNotSpace(document.querySelector('#username').value))
              document.querySelector('#namebutton').disabled = false;
          else
              document.querySelector('#namebutton').disabled = true;
        }

        // When username form is submitted, create a new request
        document.querySelector('#nameform').onsubmit = () => {
            const request = new XMLHttpRequest();
            username = document.querySelector('#username').value;
            request.open('POST', '/add_user');

            request.onload = () => {
                const data = JSON.parse(request.responseText);

                // If username was succesfully assigned
                if (data.success) {
                  localStorage.setItem('username', username);
                  document.querySelector('#channeldiv').hidden = false;
                  document.querySelector('#firstpage').remove();
                  document.querySelector('#welcome').innerHTML = `<h1>Choose a channel to start</h1>`;
                  document.querySelector('#chat').hidden = true;

                  const template = Handlebars.compile(document.querySelector('#handleuser').innerHTML);
                  const content = template({'username': username});
                  document.querySelector('#userdiv').innerHTML += content;

                }

                // If username already existed
                else {
                    document.querySelector('#please').innerHTML = `Username ${username} is taken.<br> Pick a different one:`;
                    document.querySelector('#username').value = "";
                }
            }
            const data = new FormData();
            data.append('username', username);
            request.send(data);
            return false;
        };

        add_channels();
        goToChannel();
    });
}

// Add channels function
function add_channels()
{
      document.querySelector('#channelbutton').disabled = true;

      // Enable button only if there is text in the input field
      document.querySelector('#newchannel').onkeyup = () => {
          if (document.querySelector('#newchannel').value.length > 0 && isAlnum(document.querySelector('#newchannel').value) && isNotSpace(document.querySelector('#newchannel').value))
              document.querySelector('#channelbutton').disabled = false;
          else
              document.querySelector('#channelbutton').disabled = true;
        }

      var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

        socket.on('connect', () => {
          document.querySelector('#channelform').onsubmit = () => {
              const request = new XMLHttpRequest();
              const channel = document.querySelector('#newchannel').value;
              var listed = false;
              request.open('GET', '/get_channel');

              request.onload = () => {
                  const data = JSON.parse(request.responseText);

                  data.channels.forEach(x => {

                  if (channel.toLowerCase() == x.toLowerCase()) {
                        listed = true;
                  }
                  });
                  if (listed == false){
                    document.querySelector('#newchannel').value = '';
                    socket.emit('add channel', {'selection': channel});
                    document.querySelector('#message').innerHTML = 'Created successfully!';

                  }
                  else {
                  document.querySelector('#newchannel').value = '';
                  document.querySelector('#message').innerHTML = 'Already exists!';

                  }
                }

              request.send();
              return false;
            }

        });

        socket.on('display channel', data => {
        var h4 = document.createElement('h4');
        h4.innerHTML = `<a href="" class="channel" data-channel="${data.selection}"># ${data.selection}</a>`;
        document.querySelector('#channels').append(h4);
        goToChannel();

      });
}

// This block handles adding posts
document.addEventListener('DOMContentLoaded', () => {

    // Set up a web socket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

      // Submit posts on enter
      document.querySelector('.chatmessage').addEventListener("keyup", function(event) {

        // If the key was enter
        if (event.keyCode === 13) {

          // Cancel the default action, if needed
          event.preventDefault();

          // Trigger the chat button
          document.querySelector('.chatbutton').click();
        }
      });

    // Emit channel, username and message
    document.querySelector('.chatbutton').onclick = () => {
        const selection = [`${current_channel}`, `${username}`, document.querySelector('.chatmessage').value];
        socket.emit('add post', {'selection': selection});

        // Clear post field and disable button
        document.querySelector('.chatmessage').value = '';
        document.querySelector('.chatbutton').disabled = true;
        document.querySelector('.chatmessage').onkeyup = () => {
            if (document.querySelector('.chatmessage').value.length > 0 && isNotSpace(document.querySelector('.chatmessage').value))
                document.querySelector('.chatbutton').disabled = false;
            else
                document.querySelector('.chatbutton').disabled = true;
          }
        }
    });

    // Change div with posts - append a new message
    socket.on('display post', data => {
          const template = Handlebars.compile(document.querySelector('#handleposts').innerHTML);
          const content = template({'username': data.selection[0], 'message': data.selection[1], 'time':  data.selection[2]});

          // Make sure the channel is right
          if (document.querySelector('.chatmessage').name == data.selection[3]){
              document.querySelector('#posts').innerHTML += content;
          }

          // Scroll down to the message
          if (username == data.selection[0]){
          document.querySelector('#posts').scrollTop = document.querySelector('#posts').scrollHeight;
          }
    });
});

// Go to channel function
function goToChannel()
{
    // Set links up to load new pages
    document.querySelectorAll('.channel').forEach(link => {
      link.onclick = () => {
          load_page(link.dataset.channel);
          current_channel = link.dataset.channel;
          localStorage.setItem('channel', current_channel);
          return false;
          };
      });

  // Update window on popping state
  window.onpopstate = e => {
      const data = e.state;
      if (data == null)
      {
        username = localStorage.getItem('username');
        document.title = 'Flack';
        document.querySelector('#chatroom').innerHTML = `<h1>Choose a channel to start</h1>`;
        document.querySelector('#chat').hidden = true;
        document.querySelector('#posts').hidden = true;
        localStorage.removeItem('channel');
      }
      else {
        document.title = data.title;
        document.querySelector('#chatroom').innerHTML = data.text1;
        document.querySelector('.chatmessage').name = data.text2;
        document.querySelector('#posts').name = current_channel;
        document.querySelector('#chat').hidden = false;
        document.querySelector('#posts').hidden = false;
        document.querySelector('#posts').innerHTML = '';

        const template = Handlebars.compile(document.querySelector('#handleposts').innerHTML);

        for (i = 0;  i < data.posts.length; i++) {
          const content = template({'username': data.posts[i][0], 'message': data.posts[i][1], 'time':  data.posts[i][2]});
          document.querySelector('#posts').innerHTML += content;
        }
        document.querySelector('#posts').scrollTop = document.querySelector('#posts').scrollHeight;

      }
  };
}



// Check if input is alphanumeric with spaces
function isAlnum(input)
{
    var letters = /^[0-9a-zA-Z ]+$/
    if(input.match(letters))
    {
        return true;
    }
    else
    {
        return false;
    }
}

// Check if input is only spaces
function isNotSpace(input)
{
    var letters = /^[ ]+$/
    if(input.match(letters))
    {
        return false;
    }
    else
    {
        return true;
    }
}

// Renders contents of new page in main view
function load_page(name) {
      const request = new XMLHttpRequest();
      request.open('GET', `/${name}`);
      request.onload = () => {
          const data = JSON.parse(request.responseText);
          text1 = `<h1>#${data.channel}</h1>`;
          text2 = data.channel;

          document.querySelector('#chatroom').innerHTML = text1;
          document.querySelector('.chatmessage').name = text2;
          document.querySelector('#chat').hidden = false;
          document.querySelector('#posts').hidden = false;
          document.querySelector('#posts').innerHTML = '';
          document.querySelector('#posts').name = current_channel;
          document.querySelector('.chatbutton').disabled = true;
          document.querySelector('.chatmessage').onkeyup = () => {
              if (document.querySelector('.chatmessage').value.length > 0 && isNotSpace(document.querySelector('.chatmessage').value))
                  document.querySelector('.chatbutton').disabled = false;
              else
                  document.querySelector('.chatbutton').disabled = true;
            }

          const template = Handlebars.compile(document.querySelector('#handleposts').innerHTML);

          for (i = 0;  i < data.posts.length; i++) {
            const content = template({'username': data.posts[i][0], 'message': data.posts[i][1], 'time':  data.posts[i][2]});
            document.querySelector('#posts').innerHTML += content;
          }
          document.querySelector('#posts').scrollTop = document.querySelector('#posts').scrollHeight;

          if (document.querySelector("#userdiv").innerHTML === ''){
            const template = Handlebars.compile(document.querySelector('#handleuser').innerHTML);
            const content = template({'username': username});
            document.querySelector('#userdiv').innerHTML += content;
          }

          // Push state to URL.
          document.title = name;
          history.pushState({'title': name,'text1': text1, 'text2': text2, 'posts': data.posts}, name, name);
        };

  request.send();
}

// Handles deleting posts
document.addEventListener('click', event => {
      const element = event.target;
      const div = element.closest('div');

      // Allow deleting only if current user is the author
      if (element.className == `btn hide ${username}`) {

          // Assign values to hidden delete form
          document.querySelector('.delete_post').value = div.querySelector("p").innerHTML;
          document.querySelector('.delete_username').value = username;
          document.querySelector('.delete_channel').value = current_channel;

          const request = new XMLHttpRequest();
          request.open('POST', '/delete');

          request.onload = () => {
          const data = JSON.parse(request.responseText);

          if (data.success){

            // Run CSS animation, and remove post when finished
            element.parentElement.style.animationPlayState = 'running';
            element.parentElement.addEventListener('animationend', () =>  {
            element.parentElement.remove();
            });
          }

          else {
            alert('Something went wrong!');
          }
        }

        const data = new FormData();
        data.append('delete_username', username);
        data.append('delete_post', div.querySelector("p").innerHTML)
        data.append('delete_channel', current_channel)
        request.send(data);
        return false;
    }
});
