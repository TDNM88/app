import React, { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null); // State mới để lưu trữ phản hồi API

  const generateImage = async (e) => {
  e.preventDefault();
  setError('');
  setApiResponse(null); // Xóa phản hồi API trước đó
  try {
    const response = await axios.post('/api/generate-image', { prompt });
    if (response.data.imageUrl) {
      setImageUrl(response.data.imageUrl);
      setApiResponse(response.data); // Lưu trữ phản hồi API vào state
    } else {
      setError('Failed to generate image.');
    }
  } catch (error) {
    setError('Failed to generate image.');
    console.error('Error:', error);
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
      {imageUrl && <img src={imageUrl} alt="Generated" />}
      {apiResponse && <pre>{JSON.stringify(apiResponse, null, 2)}</pre>} {/* Hiển thị phản hồi API */}
    </div>
  );
}