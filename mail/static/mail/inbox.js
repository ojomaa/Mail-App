document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;

    // By default, load the inbox ;)
    load_mailbox('inbox');
  });


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function send_email(event) {
  event.preventDefault();
  console.log('Form Submitted!');
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => {
      console.log('Response Status:', response.status);
      return response.json()
    })
    .then(result => {
      // Print result
      console.log('Response Body:', result);
    })
    .catch(error => console.log('error', error));
    setTimeout(function() {
      mailbox('sent');
    }, 500);
}

function mailbox(page) {
  console.log("email is sent");
  load_mailbox(`${page}`);
  const hello = document.querySelector('h3').textContent;
  const lowercasedText = hello.charAt(0).toLowerCase() + hello.slice(1);

  fetch(`/emails/${lowercasedText}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);
      emails.forEach(element => {
        const element1 = document.createElement('div');
        element1.innerHTML = `
          <div id=${element.id} class='card'>
            <div class="card-body">
              <h5 class="card-title">${element.subject}</h5>
              <h6 class="card-subtitle mb-2 text-muted">From: ${element.sender} To: ${element.recipients}</h6>
              <h6 class="card-timestamp">${element.timestamp}</h6>
              <button id='open${element.id}' class="btn btn-sm btn-outline-primary">Open</button>
            </div>
          </div>`;
        document.querySelector('#emails-view').append(element1);
      });
    });
  return false;
}