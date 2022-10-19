document.addEventListener('DOMContentLoaded', function () {
  mailbox = "inbox";
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    mailbox = "inbox";
    load_mailbox('inbox')
  });
  document.querySelector('#sent').addEventListener('click', () => {
    mailbox = "sent";
    load_mailbox('sent')
  });
  document.querySelector('#archived').addEventListener('click', () => {
    mailbox = "archive";
    load_mailbox('archive')
  });
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipients = "", subject = "") {


  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields  
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').addEventListener('submit', function () {
    fetch(`/emails`, {
      method: 'POST',
      body: JSON.stringify({
        recipients: `${document.querySelector('#compose-recipients').value}`,
        subject: `${document.querySelector('#compose-subject').value}`,
        body: `${document.querySelector('#compose-body').value}`
      })
    })
      .then(response => response.json())
      .then(result => {
        console.log(result);
      })
  });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3> ${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)} </h3>`;
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        var item = document.createElement('div');
        item.innerHTML = `
        <div class="email" id="email-btn${email.id}" style="border:1px black solid; width:100%; margin:15px;">
        <center>
        <div style="text-align:start; padding:20px; display:inline-block; font:24px bold;"> |${email.sender}| </div>
        <div style="text-align:center; padding:20px; display: inline-block; font:24px bold; "> |${email.subject}| </div>
        <div style="text-align:end; padding:20px; display:inline-block; font:24px bold;"> |${email.timestamp}| </div>
        </center>
        </div>
      `;
        document.querySelector('#emails-view').appendChild(item);
        item.addEventListener("click", () => {
          show_email(email.id, mailbox);
        });
      });
    });
}

function show_email(id) {
  let btn_val = "Archive";
  flag_archive = false;
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      if (email.archived == true) {
        flag_archive = true;
        btn_val = "Unarchive";
      }
      email.viewed = true;
      document.querySelector('#emails-view').innerHTML = "";
      var item = document.createElement('div');
      item.id = `view-holder`;
      item.innerHTML = `
      <div class="view-holder-body" style="margin:24px;">
        <h4>Sender : ${email.sender}</h4> <br>
        <h4>Recipients : ${email.recipients}</h4> <br>
        <h4>Subject : ${email.subject}</h4> <br>
        <h4>Time : ${email.timestamp}</h4> <br>
        <h3 style="border:4px solid;"> ${email.body} </h3>
        <input type="submit" class="btn btn-primary" onclick="goBack(${email.id})" value=Back>
        <input type="submit" class="btn btn-primary" onclick="archive_email(${email.id})" value=${btn_val}>
        <input type="submit" class="btn btn-primary" id="reply-btn" value="Reply">
        </div>
      `;
      
      document.querySelector('#emails-view').appendChild(item);
      document.querySelector('#reply-btn').addEventListener('click', () => {
        reply_email(email.sender, email.subject);
      }
      );
    });
}
function archive_email(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      if (email.archived == false) {
        email.archived = true;
        flag_archive = true;
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify(email)
        })
        load_mailbox("archive");
        return;
      }
      else {
        email.archived = false;
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify(email)
        })
        load_mailbox("inbox");
        return;
      }
    })
}
function goBack(id) {

  if (mailbox == "sent") {
    load_mailbox('sent');
    return;
  }
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      viewed: true
    })
  })
  load_mailbox("inbox");
}

function reply_email(recipients, subject) {
  compose_email(recipients, subject);
}