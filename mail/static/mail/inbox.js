document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send email upon clicking submit button
  document.querySelector('#compose-form').onsubmit = function(event) {
    event.preventDefault();
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.getElementById('compose-recipients').value,
        subject: document.getElementById('compose-subject').value,
        body: document.getElementById('compose-body').value,
        //read: false,
      })
    })
    .then(response => response.json())

    load_mailbox('sent');
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get emails for a particular mailbox
  fetch(`/emails/${mailbox}`, {
    method:'GET'
  })
  .then(response => response.json())
  .then(results => {
    //console.log(results);
    results.forEach((result) => {
      
      // Create and style div
      const div = document.createElement('div');
      div.style.border = "1px solid gray";
      div.style.borderRadius = "4px";
      div.style.marginBottom = "10px";
      div.style.padding = "8px";
      
      // Style color based on email read status
      if (result.read === false) {
        div.style.backgroundColor = "white"
      } else {
        div.style.backgroundColor = "silver"
      }

      // Get email sender, subject, and timestamp
      let sender = result.sender;
      let subject = result.subject;
      let timestamp = result.timestamp;
      let id = result.id;

      // Set div text
      div.innerHTML = `<p><b>Sent by: </b>${sender}</p>` +
                      `<p><b>Subject: </b>${subject}</p>` +
                      `<p>${timestamp}</p>`

      // Append div to email view
      div.addEventListener('click', function() {
        view_email(id);
      })
      document.querySelector('#emails-view').append(div);
    })
  })
}

function view_email(id) {

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email-view').style.display = 'block';

  // Clear read-email-view
  document.getElementById('read-email-view').innerHTML = '';

  // Mark email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  
  fetch(`/emails/${id}`, {
    method: 'GET'
  })
  .then(response => response.json())
  .then(result => {
    
    // Create and style div
    const div = document.createElement('div');
    div.style.border = "1px solid gray";
    div.style.borderRadius = "4px";
    div.style.marginBottom = "10px";
    div.style.padding = "8px";

    // Get email sender, subject, and timestamp
    let sender = result.sender;
    let subject = result.subject;
    let timestamp = result.timestamp;
    let body = result.body;
    let archive_status = result.archived;

    // Set div text
    let html = `<p><b>Sent by: </b>${sender}</p>` +
               `<p><b>Subject: </b>${subject}</p>` +
               `<p>${timestamp}</p>` +
               `<p>${body}</p>`

    // Create text for archive/unarchive button
    let button_text = "Archive";
    if (archive_status === true) {
      button_text = "Unarchive";
    }

    // Create archive/unarchive and reply buttons
    html += `<button type="button" id="archive-button" class="btn btn-primary">${button_text}</button><br><br>`
    html += `<button type="button" id="reply-button" class="btn btn-primary">Reply</button>`

    // Append div to read view
    div.innerHTML = html
    document.querySelector('#read-email-view').append(div);

    // Make button archive/unarchive emails
    document.getElementById('archive-button').addEventListener('click', function() {
      if (button_text === "Archive") {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        })
      } else {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        })
      }
      load_mailbox('inbox');
    })

    // Make button reply emails
    document.getElementById('reply-button').addEventListener('click', function() {   
      compose_email();

      // Create sender
      document.querySelector('#compose-recipients').value = sender;

      // Create subject
      if (!subject.startsWith('Re: ')) {
        subject = `Re: ${subject}`;
      }
      document.querySelector('#compose-subject').value = subject;

      // Pre-fill body
      document.querySelector('#compose-body').value = `\n\nOn ${timestamp} ${sender} wrote:\n\n${body}\n\n`;
    })
  })
}