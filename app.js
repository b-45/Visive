require('dotenv').config({ path: 'variables.env' })

const express = require('express')
const app = express()

const lambda = require('./lambda');

app.use(express.static(__dirname + '/public'))

app.get('/.netlify/functions/index', async (req, res)=>{
  console.log('data ', req.query);
  const event = {
    queryStringParameters: req.query
  }
  const result = await lambda.handler(event, {});
  res.send(result.body);
})

app.listen(3000, () => {
  console.log('live at 3000')
})
