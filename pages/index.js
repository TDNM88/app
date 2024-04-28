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
    const jobId = response.data.job.id;

    // Hàm đệ quy để theo dõi trạng thái của công việc
    const checkJobStatus = async () => {
      try {
        const jobResponse = await axios.get(`/api/job/${jobId}`);
        const jobStatus = jobResponse.data.job.status;

        if (jobStatus === "SUCCESS") {
          // Nếu công việc hoàn thành, cập nhật imageUrl và dừng loading
          setImageUrl(jobResponse.data.job.successInfo.images[0].url);
          setApiResponse(jobResponse.data.job);
          setLoading(false);
        } else if (jobStatus === "FAILED") {
          // Nếu công việc thất bại, hiển thị thông báo lỗi và dừng loading
          setError('Failed to generate image.');
          setLoading(false);
        } else {
          // Nếu công việc vẫn đang chạy, tiếp tục theo dõi trạng thái
          setTimeout(checkJobStatus, 1000); // Thử lại sau 1 giây
        }
      } catch (error) {
        setError('Failed to generate image.');
        console.error('Error:', error);
        setLoading(false);
      }
    };

    checkJobStatus(); // Bắt đầu theo dõi trạng thái của công việc
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