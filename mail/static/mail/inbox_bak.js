document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('.btn-primary').addEventListener('click', () => send_email());

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
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  // Get emails
  fetch('/emails/' + mailbox, {
    method:'GET',
  })
  .then(response => response.json())
  .then(results => {
    console.log(results);
    results.forEach((result) => {
      if (result.recipients.includes(document.querySelector('h2').innerHTML) || result.sender.includes(document.querySelector('h2').innerHTML)) {
        //create div        
        const element = document.createElement('div');
      
        // styling
        element.style.border = "1px solid black";
        element.style.borderRadius = "4px";
        element.style.marginBottom = "10px";
        element.style.padding = "8px";
        if (result.read === false) {
          element.style.backgroundColor = "white";
        } else {
          element.style.backgroundColor = "LightGray";
        }
  
        // get data
        sender = result.sender;
        subject = result.subject;
        time = result.timestamp;
        id = result.id;
  
        // create HTML
        html = '<p class = "sentby">' + "<b>Sent by: </b>" + sender + '</p>' +
               '<p class = "subject">' + "<b>Subject: </b>" + subject + '</p>' +
               '<p class = "time">' + time + '</p>',
        
        element.innerHTML = html;

        document.querySelector('#emails-view').append(element);
        element.addEventListener('click', () => read_email(result.id));        
      }
    })      
  })

}

function send_email() {
  document.querySelector('#compose-form').onsubmit = function() {
    fetch('/emails', {
      method:'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
    });

    load_mailbox('sent')
  }
}


function read_email(id) {

  // Clear and show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email-view').style.display = 'block';
  document.querySelector('#read-email-view').innerHTML = '';

  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  fetch('/emails/' + id, {
    method: 'GET',
  })
  .then(response => response.json())
  .then(result => {

    // create element
    const div = document.createElement('div');
      
    // styling
    div.style.border = "1px solid black";
    div.style.borderRadius = "4px";
    div.style.marginBottom = "10px";
    div.style.padding = "8px";
    div.style.backgroundColor = "white";

    // get data
    sender = result.sender;
    subject = result.subject;
    time = result.timestamp;
    body = result.body;
    archived = result.archived;

    // create HTML
    var html = '<p class = "sentby">' + "<b>Sent by: </b>" + sender + '</p>' +
               '<p class = "subject">' + "<b>Subject: </b>" + subject + '</p>' +
               '<p class = "time">' + time + '</p>' +
               '<p class = "body">' + body + '</p>';

    // archive/unarchive

    if (archived === false) {
      html += '<button onclick="archive_email(id)" class="btn btn-sm btn-outline-primary" id="archive_email">Archive</button>'
      
      //document.querySelector('#archive_email').addEventListener('click', () => archive_email(id));
    } else {
      html += '<button onclick="unarchive_email(id)" class="btn btn-sm btn-outline-primary" id="unarchive_email">Unarchive</button>'
      //document.querySelector('#unarchive_email').addEventListener('click', () => unarchive_email(id));
    }

    div.innerHTML = html;
    document.querySelector('#read-email-view').append(div);
  })

}

function archive_email(id) {
  console.log('ID is: ' + id)
  console.log("archive button")
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
}

function unarchive_email(id) {
  console.log("unarchive button")
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
}