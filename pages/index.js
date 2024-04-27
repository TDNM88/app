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
  setImageUrl(''); // Reset the imageUrl state
  setApiResponse(null); // Reset the apiResponse state
  try {
    // Step 1: Send POST request to generate the image and get jobID
    const generateResponse = await axios.post('/api/generate-image', { prompt });
    const jobID = generateResponse.data.jobID;

    // Step 2: Poll the API to get the job result using jobID
    const checkJobStatus = async (jobID) => {
      try {
        const statusResponse = await axios.get(`/api/job-status/${jobID}`);
        if (statusResponse.data.job &&
            statusResponse.data.job.status === 'SUCCESS' && // Replace 'SUCCESS' with the actual success status from the API
            statusResponse.data.job.successInfo &&
            statusResponse.data.job.successInfo.images &&
            statusResponse.data.job.successInfo.images.length > 0) {
          // Step 3: Get the image URL from the job result
          const imageUrl = statusResponse.data.job.successInfo.images[0].url;
          setImageUrl(imageUrl); // Update state with the image URL
        } else if (statusResponse.data.job &&
                   statusResponse.data.job.status === 'PENDING') {
          // If job is still pending, poll again after a delay
          setTimeout(() => checkJobStatus(jobID), 2000); // Adjust polling interval as needed
        } else {
          // Handle failed or unknown job status
          setError('Failed to retrieve image or job status unknown.');
        }
      } catch (error) {
        setError('Error checking job status.');
        console.error('Error:', error);
      }
    };

    // Initial call to check job status
    checkJobStatus(jobID);
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