const express = require('express');
const app = express();
const PORT = 3000;

app.use('/', express.static('public'));

app.get('/', (req,res)=>{
  res.send('Welcome!');
});

app.listen(PORT, ()=>{
  console.log(`Connected on port ${PORT}`);
});
