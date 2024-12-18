import WebTorrent from 'webtorrent';
import express from 'express';
import open from 'open';

const app = express();
const client = new WebTorrent();

app.get('/', (req, res) => {
  res.send(`
    <h1>Benny DownLoader</h1>
    <form action="/add-torrent" method="GET">
      <input type="text" name="magnet" placeholder="Enter Magnet Link" style="width: 80%; padding: 10px;" required />
      <button type="submit" style="padding: 10px;">Start Download</button>
    </form>
  `);
});

app.get('/add-torrent', (req, res) => {
  const magnetURI = req.query.magnet;

  if (!magnetURI) {
    return res.status(400).send('Magnet link is required!');
  }

  client.add(magnetURI, { path: process.cwd() }, (torrent) => {
    res.send(`
      <h2>Downloading: ${torrent.name}</h2>
      <p>Check progress on <a href="/progress">/progress</a></p>
    `);

    torrent.on('done', () => {
      console.log(`Torrent ${torrent.name} finished downloading!`);
    });
  });
});

app.get('/progress', (req, res) => {
  const torrent = client.torrents[0]; // Assume only one torrent at a time for simplicity
  if (!torrent) {
    return res.send('<h2>No active torrents</h2><a href="/">Home</a>');
  }

  res.send(`
    <h1>Progress: ${torrent.name}</h1>
    <div style="width: 100%; border: 1px solid #000; margin-bottom: 10px;">
      <div style="width: ${torrent.progress * 100}%; background: green; height: 20px;"></div>
    </div>
    <p>Progress: ${(torrent.progress * 100).toFixed(1)}%</p>
    <p>Download Speed: ${(torrent.downloadSpeed / 1024).toFixed(1)} KB/s</p>
    <p>Upload Speed: ${(torrent.uploadSpeed / 1024).toFixed(1)} KB/s</p>
    <p>Peers: ${torrent.numPeers}</p>
    <a href="/">Home</a>
    <script>
      setTimeout(() => {
        window.location.reload(); // Refresh page every 2 seconds to update progress
      }, 2000);
    </script>
  `);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});
