import React, { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const generateImage = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/api/generate-image', { prompt });
      setImageUrl(response.data.imageUrl);
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
    </div>
  );
}