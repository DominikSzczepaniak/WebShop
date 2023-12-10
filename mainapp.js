const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/css', express.static(__dirname + '/css'))
app.get('/', (req, res) => {
  res.render('mainPage');
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
