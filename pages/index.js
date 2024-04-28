import React, { useState, useEffect } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null); // State mới để lưu trữ phản hồi API
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading

  useEffect(() => {
    // Nếu imageUrl thay đổi, tạo một div với ảnh và hiển thị
    if (imageUrl) {
      const imageDiv = document.createElement('div');
      const image = document.createElement('img');
      image.src = imageUrl;
      image.alt = 'Generated Image';
      imageDiv.appendChild(image);
      document.getElementById('imageContainer').appendChild(imageDiv);
    }
  }, [imageUrl]);

  const generateImage = async (e) => {
    e.preventDefault();
    setError('');
    setApiResponse(null);
    setLoading(true); // Đặt trạng thái loading là true khi bắt đầu gửi yêu cầu

    try {
      const resp = await fetch('/api/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });

      if (!resp.ok) {
        const json = await resp.json();
        setError('Failed to generate image.');
        setLoading(false);
        return;
      }

      const json = await resp.json();
      const jobId = json.id;

      // Hàm đệ quy để theo dõi trạng thái của công việc
      const checkJobStatus = async () => {
        try {
          const jobResp = await fetch(`/api/job/${jobId}`);
          const jobJson = await jobResp.json();
          const jobStatus = jobJson.status;

          if (jobStatus === "SUCCESS") {
            // Nếu công việc hoàn thành, cập nhật imageUrl và dừng loading
            const image = jobJson.successInfo.images[0];
            if (image && image.url) {
              setImageUrl(image.url);
              setApiResponse(jobJson);
              setLoading(false);
            } else {
              // Nếu không nhận được URL hình ảnh, tiếp tục kiểm tra
              setTimeout(checkJobStatus, 3000); // Thử lại sau 3 giây
            }
          } else if (jobStatus === "FAILED") {
            // Nếu công việc thất bại, hiển thị thông báo lỗi và dừng loading
            setError('Failed to generate image.');
            setLoading(false);
          } else {
            // Nếu công việc vẫn đang chạy, tiếp tục theo dõi trạng thái
            setTimeout(checkJobStatus, 3000); // Thử lại sau 3 giây
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
      {loading && <p>Loading...</p>} {/* Hiển thị thông báo loading nếu đang loading */}
      <div id="imageContainer"></div> {/* Div để chứa hình ảnh kết quả */}
      {apiResponse && <pre>{JSON.stringify(apiResponse, null, 2)}</pre>} {/* Hiển thị phản hồi API */}
    </div>
  );
}