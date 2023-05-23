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
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function load_email(email) {
  
  // Show the email and hide other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';

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

      // Create a div for each email
      emails.forEach(element => {
        const element1 = document.createElement('div');
        element1.innerHTML = `
          <div id='div${element.id}' class='card'>
            <div class="card-body">
              <h5 class="card-title">${element.subject}</h5>
              <h6 class="card-subtitle mb-2 text-muted">From: ${element.sender} To: ${element.recipients}</h6>
              <h6 class="card-timestamp">${element.timestamp}</h6>
              <button id='open${element.id}' class="btn btn-sm btn-outline-primary">Open</button>
            </div>
          </div>`;
        document.querySelector('#emails-view').append(element1);

        // Change color to grey if email is read
        if (element.read === true) {
          document.querySelector(`#div${element.id}`).style.color = 'grey';
        };

        // Open the email when open button is clicked
        document.querySelector(`#open${element.id}`).addEventListener('click', () => email(`${element.id}`));
      });
    });
  return false;
}

function email(id) {

  // Open the Email
  load_email(id)
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    const emailCont= document.createElement('div');

    // Email is not archived
    if (email.archived === false) {
      emailCont.innerHTML = `
      <div>
        <h2>${email.subject}</h2>
        <p id='sender'>From: ${email.sender}</p>
        <p id='recipients'>To: ${email.recipients}</p>
        <p id='body'>${email.body}</p>
        <p id='timestamp'> Sent on ${email.timestamp}</p>
        <button id='archive' class="btn btn-sm btn-outline-primary"> Archive </button>
      </div>
      `
    // Email is archived
    } else { 
      emailCont.innerHTML = `
      <div>
        <h2>${email.subject}</h2>
        <p id='sender'>From: ${email.sender}</p>
        <p id='recipients'>To: ${email.recipients}</p>
        <p id='body'>${email.body}</p>
        <p id='timestamp'> Sent on ${email.timestamp}</p>
        <button id='archive' class="btn btn-sm btn-outline-primary"> Un-Archive </button>
      </div>
    `}
    document.querySelector('#email-view').innerHTML = '';
    document.querySelector('#email-view').append(emailCont);

    // Run archive/unarchive function if archive button is pressed
    if (email.archived === false) {
      document.querySelector(`#archive`).addEventListener('click', () => archive(`${email.id}`));
    } else {
      document.querySelector(`#archive`).addEventListener('click', () => unarchive(`${email.id}`));
    }
  })
  .catch(error => {
    console.error('Error fetching email:', error);
  });

  // Change the read field to True
  fetch(`/emails/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      read: true,
    })
  })
}

function archive(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      archived: true,
    })
  });
  setTimeout(function() {
    mailbox('inbox');
  }, 500);
}

function unarchive(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      archived: false,
    })
  });
  setTimeout(function() {
    mailbox('inbox');
  }, 500);
}