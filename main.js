const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded =  require('body-parser').urlencoded;
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();
const port = 80;
app.use(urlencoded({extended:false}));

// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post('/voice', (req, res) => {
  // Use the Twilio Node.js SDK to build an XML response
  const IVR = new VoiceResponse();

  const gather = IVR.gather({
    numDigits: 1,
    action: '/gather',
  });
  gather.say('Thank you for calling. To call Joshua, press 1. If you want to receive a text message, press 2');

  // If the user doesn't enter input, loop
  IVR.redirect('/voice');

  // Render the response as XML in reply to the webhook request - DRY?
  res.type('text/xml');
  res.send(IVR.toString());
  console.log(res);
});

// Create a route that will handle <Gather> input
app.post('/gather', (req, res) => {
  // Use the Twilio Node.js SDK to build an XML response
  const IVR = new VoiceResponse();
  const MessagingClient = new MessagingResponse();
  const refer = IVR.refer();
  // If the user entered digits, process their request
  if (req.body.Digits) {
    switch (req.body.Digits) {
      case '1':
        IVR.say('We are transferring your call now, please hold.');
        IVR.dial('+12623442209');
	break;
      case '2':
        IVR.say('Were sending that text right now.');
	// Messaging client sending SMS, seems there is an outage currently on Twilio...
	MessagingClient.message('Thank you for calling, this is the requested message');
	console.log(res.toString());
        break;
      default:
        IVR.say("Sorry, I'm not sure I understood the input.");
        IVR.pause();
        IVR.redirect('/voice'); // Redirect to "root" route in case of invalid input.
        break;
    }
  } else {
    // If no input was sent, redirect to the /voice route
    IVR.redirect('/voice');
  }

  // Render the response as XML in reply to the webhook request - DRY?
  res.type('text/xml');
  res.send(IVR.toString());
  console.log(res);
});

app.listen(port, () => {
  console.log(`Application started on http://localhost:${port}`);
});
