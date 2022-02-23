let express = require('express');
let path = require('path');
let auth = require('http-auth');
let app = express();
let port = process.env.PORT || 8080;
let basic = auth.basic({
  realm: 'API DOC',
  file: 'htpasswd'
});

app.use(auth.connect(basic));
app.use(express.static(path.join(__dirname, `public`)));
app.listen(port, function () {
  console.log(`Server Listening on ${port}`); // eslint-disable-line no-console
});
