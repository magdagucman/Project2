// If user submitted the display name before, fetch it from localStorage
if (localStorage.getItem('username')) {
    var username = localStorage.getItem('username');
    document.addEventListener('DOMContentLoaded', () => {

        var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

        document.querySelector('#firstpage').remove();
        document.querySelector('#welcome').innerHTML = `<h1>Hello, ${username}!<br></h1><h2>Choose a channel to start.</h2>`;

        add_channels();
        goToChannel();
    });
}

else {
    document.addEventListener('DOMContentLoaded', () => {
      goToChannel();
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

        document.querySelector('#nameform').onsubmit = () => {
            const request = new XMLHttpRequest();
            var username = document.querySelector('#username').value;
            request.open('POST', '/add_user');

            request.onload = () => {
                const data = JSON.parse(request.responseText);
                if (data.success) {
                  localStorage.setItem('username', username);
                  document.querySelector('#channeldiv').hidden = false;
                  document.querySelector('#firstpage').remove();
                  document.querySelector('#welcome').innerHTML = `<h1>Hello, ${username}!<br></h1><h2>Choose a channel to start.</h2>`;
                  goToChannel();
                }

                else {
                    document.querySelector('#please').innerHTML = `Username ${username} is taken.<br> Pick a different one:`;
                    document.querySelector('#username').value = "";
                }
            }
            const data = new FormData();
            data.append('username', username);
            request.send(data);
            return false;
            goToChannel();
        };

        // Enable adding channels
        add_channels();

        goToChannel();
    });
}

goToChannel();
// Add channels
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
                    document.querySelector('#message').innerHTML = 'Created successfully!';
                    document.querySelector('#newchannel').value = '';
                    socket.emit('add channel', {'selection': channel});
                  }
                  else {
                  document.querySelector('#message').innerHTML = 'Already exists!';
                  document.querySelector('#newchannel').value = '';
                  }
                }

              request.send();
              return false;
            }
          });

        socket.on('display channel', data => {
        const h4 = document.createElement('h4');
        h4.innerHTML = `<a href="" class="channel" data-channel="${data.selection}">${data.selection}</a>`;
        document.querySelector('#channels').append(h4);
        const div = document.createElement('div');
        div.hidden = true;
        div.innerHTML = `<form class="form-group form-inline"> <input autocomplete="off" autofocus class="form-control" name="${data.selection}" placeholder="What's on your mind?" type="text"><button class="btn btns chatbutton" type="submit" value="Create">Post</button>`
        document.querySelector('#channels').append(div);
        goToChannel();
      });
      goToChannel();
}

// Go to channel
function goToChannel()
{
    // Set links up to load new pages.
    document.querySelectorAll('.channel').forEach(link => {
      link.onclick = () => {
          load_page(link.dataset.channel);
          return false;
          };
      });


    // Renders contents of new page in main view.
    function load_page(name) {
          const request = new XMLHttpRequest();
          request.open('GET', `/${name}`);
          request.onload = () => {
              const response = request.responseText;
              text1 = `<h1>${response} Channel</h1>`;
              text2 = `<form class="form-group form-inline"> <textarea autocomplete="off" autofocus class="form-control" name="${response}" placeholder="What's on your mind?" rows="3" type="text"></textarea><button class="btn btns chatbutton" type="submit" value="Create">Post</button></form>`;
              document.querySelector('#chatroom').innerHTML = text1;
              document.querySelector('#chat').innerHTML = text2;

              // Push state to URL.
              document.title = name;
              history.pushState({'title': name,'text1': text1, 'text2': text2}, name, name);
      };
      request.send();
  }

  // Update window on popping state.
  window.onpopstate = e => {
      const data = e.state;
      if (data == null)
      {
        username = localStorage.getItem('username');
        document.title = 'Flack';
        document.querySelector('#chatroom').innerHTML = `<h1>Hello, ${username}!<br></h1>`;
        document.querySelector('#chat').innerHTML = '<h2>Choose a channel to start.</h2>';
      }
      else {
        document.title = data.title;
        document.querySelector('#chatroom').innerHTML = data.text1;
        document.querySelector('#chat').innerHTML = data.text2;
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
