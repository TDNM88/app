// pages/index.js
import React, { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading

  const generateImage = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Đặt trạng thái loading là true khi bắt đầu gửi yêu cầu

    try {
      const response = await axios.post('/api/generate-image', { prompt });
      const imageUrl = response.data.imageUrl;

      // Nếu imageUrl tồn tại, cập nhật state và dừng loading
      if (imageUrl) {
        setImageUrl(imageUrl);
        setLoading(false);
      }
    } catch (error) {
      setError('Failed to generate image.');
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Tams Image Generator</h1>
      <form onSubmit={generateImage}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt"
          required
        />
        <button type="submit">Generate Image</button>
      </form>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>} {/* Hiển thị thông báo loading nếu đang loading */}
      {imageUrl && <img src={imageUrl} alt="Generated Image" />} {/* Hiển thị hình ảnh nếu tồn tại */}
    </div>
  );
}