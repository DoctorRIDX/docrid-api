const express = require('express');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// Contoh pengecekan API Key sederhana
const VALID_APIKEY = 'docrid'; // API Key publik gratis milikmu

app.get('/api/smeme', async (req, res) => {
  try {
    const { apikey, url, top, bottom } = req.query;

    // 1. Validasi API Key
    if (!apikey || apikey !== VALID_APIKEY) {
      return res.status(401).json({ status: false, error: 'API Key tidak valid! Gunakan apikey=docrid' });
    }

    // 2. Validasi URL Gambar
    if (!url) {
      return res.status(400).json({ status: false, error: 'Parameter url gambar diperlukan!' });
    }

    // 3. Download Gambar
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const image = await loadImage(Buffer.from(response.data));

    // 4. Buat Canvas sesuai ukuran gambar
    const width = image.width;
    const height = image.height;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Gambar Foto Asli
    ctx.drawImage(image, 0, 0, width, height);

    // Styling Teks Meme (Font Impact / Sans-Serif)
    const fontSize = Math.floor(height / 8);
    ctx.font = `bold ${fontSize}px "Impact", "Arial Black", sans-serif`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = Math.floor(fontSize / 8);
    ctx.textAlign = 'center';

    // Gambar Teks Atas
    if (top) {
      const topText = top.toUpperCase();
      ctx.strokeText(topText, width / 2, fontSize + 10);
      ctx.fillText(topText, width / 2, fontSize + 10);
    }

    // Gambar Teks Bawah
    if (bottom) {
      const bottomText = bottom.toUpperCase();
      ctx.strokeText(bottomText, width / 2, height - 20);
      ctx.fillText(bottomText, width / 2, height - 20);
    }

    // 5. Tambahkan Watermark 'docrid-meme' di pojok kanan bawah
    const wmFontSize = Math.floor(height / 35) || 12;
    ctx.font = `${wmFontSize}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.textAlign = 'right';

    ctx.strokeText('docrid-meme', width - 10, height - 10);
    ctx.fillText('docrid-meme', width - 10, height - 10);

    // 6. Kirim Output sebagai Gambar PNG
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);

  } catch (error) {
    console.error('Error generating meme:', error);
    res.status(500).json({ status: false, error: 'Gagal memproses gambar.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Docrid API berjalan di port ${PORT}`));
