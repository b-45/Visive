const https = require('https');

function request(email) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email_address: email,
      status: 'subscribed'
    });
    const options = {
      method: 'POST',
      host: 'us19.api.mailchimp.com',
      port: 443,
      path: '/3.0/lists/3afd7d1937/members',
      headers: {
        'postman-token': 'a13333e7-6268-24e3-3c4d-e2b265824d15',
        'cache-control': 'no-cache',
        'authorization': process.env.MAILCHIMP_AUTH,
        'content-type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          data = JSON.parse(data);
          console.log(data)
          if(data.title == 'Member Exists') {
          	data.detail = 'You have already subscribed'
          }
          if(data.id || data.unique_email_id) {
          	data.title = 'success',
          	data.status = 200;
          	data.detail = 'Congratulations! You have subscribed successfully!'
          }
          resolve(data);
        } catch(e) {
          resolve({status: 500, detail: 'Unable to process request', title: 'Server error'});
        }
      });
    });
    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
      resolve({status: 500, detail: e.message || 'Unable to process request', title: 'Server error'});
    });
    // write data to request body
    req.write(postData);
    req.end();
  });
}




exports.handler = async (event, context) => {
  let email = event.queryStringParameters.email;
  let body = {
  	error: true,
  	status: 500,
  	message: 'Unable to process request',
  	title: 'Server error'
  };
  try {
  	const data = await request(email);
  	body = {
	  	error: false,
	  	status: data.status,
	  	message: data.detail,
	  	title: data.title
	  };
  } catch(e) {
  	body.message = e.message || body.message;
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify(body)
  };
};
