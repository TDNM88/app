import React, { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null); // State mới để lưu trữ phản hồi API
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading

  const generateImage = async (e) => {
    e.preventDefault();
    setError('');
    setApiResponse(null);
    setLoading(true); // Đặt trạng thái loading là true khi bắt đầu gửi yêu cầu

    try {
      const response = await axios.post('/api/generate-image', { prompt });
      const jobId = response.data.job.id;

      // Chờ 30 giây trước khi kiểm tra lại URL
      setTimeout(async () => {
        try {
          const jobResponse = await axios.get(`/api/job/${jobId}`);
          const imageUrl = jobResponse.data?.job?.successInfo?.images?.[0]?.url;

          if (imageUrl) {
            setImageUrl(imageUrl);
            setApiResponse(jobResponse.data.job);
            setLoading(false);
          } else {
            setError('Timeout waiting for imageUrl');
            setLoading(false);
          }
        } catch (error) {
          setError('Failed to generate image.');
          console.error('Error:', error);
          setLoading(false);
        }
      }, 30000); // Chờ 30 giây (30000 milliseconds)
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
      {imageUrl && <img src={imageUrl} alt="Generated" />} {/* Hiển thị ảnh nếu đã nhận được URL */}
      {apiResponse && <pre>{JSON.stringify(apiResponse, null, 2)}</pre>} {/* Hiển thị phản hồi API */}
    </div>
  );
}
