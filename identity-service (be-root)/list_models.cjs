const https = require('https');
const url = "https://generativelanguage.googleapis.com/v1beta/models?key=AQ.Ab8RN6JLnuROqzlgMNGmTE3o9OQMDXdBZBOwBFZBGhMyVY-0vA";

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const models = JSON.parse(data).models;
    if (models) {
      models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
    } else {
      console.log(data);
    }
  });
});
