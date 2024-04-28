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
  setApiResponse(null);
  setLoading(true); // Đặt trạng thái loading là true khi bắt đầu gửi yêu cầu

  try {
    const response = await axios.post('/api/generate-image', { prompt });
    const jobId = response.data.job.id; // Lấy ID công việc từ phản hồi API
    let imageUrl = null;

    // Lặp lại việc lấy thông tin công việc đến khi công việc hoàn thành và có URL hình ảnh
    while (!imageUrl) {
      const jobResponse = await axios.get(`/api/get-job-status/${jobId}`);
      const jobStatus = jobResponse.data.job.status;

      // Nếu công việc đã hoàn thành và có URL hình ảnh, cập nhật imageUrl và dừng vòng lặp
      if (jobStatus === 'SUCCESS' && jobResponse.data.job.successInfo.images.length > 0) {
        imageUrl = jobResponse.data.job.successInfo.images[0].url;
      }

      // Nếu công việc không thành công, đặt lỗi và dừng vòng lặp
      if (jobStatus === 'FAILED') {
        setError('Failed to generate image.');
        break;
      }

      // Đợi một khoảng thời gian trước khi kiểm tra lại trạng thái công việc
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Cập nhật imageUrl nếu đã tìm thấy
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
      {imageUrl && <img src={imageUrl} alt="Generated" />}
      {apiResponse && <pre>{JSON.stringify(apiResponse, null, 2)}</pre>} {/* Hiển thị phản hồi API */}
    </div>
  );
}