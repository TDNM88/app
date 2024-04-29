import React, { useState } from 'react';
import axios from 'axios';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setImageSrc(null);
    setJobId(null);
    setJobStatus(null);

    try {
      const response = await axios.post('/api/generate-image', { prompt });
      if (response.status === 200 && response.data.jobId) {
        setJobId(response.data.jobId);
        pollForImageStatus(response.data.jobId);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false);
    }
  };

  const pollForImageStatus = async (jobId) => {
    try {
      while (loading) {
        const response = await axios.get(`/api/job/${jobId}`);
        const jobData = response.data.job;

        setJobStatus(jobData); // Update the job status in the state

        if (jobData.status === 'SUCCESS' && jobData.successInfo.images.length > 0) {
          const imageUrl = jobData.successInfo.images[0].url;
          setImageSrc(imageUrl);
          setLoading(false); // Job is complete, stop loading
          break; // Exit the polling loop
        } else if (jobData.status === 'FAILED') {
          console.error('Job failed:', jobData.failedInfo.reason);
          setLoading(false); // Job failed, stop loading
          break; // Exit the polling loop
        }

        // Delay the next poll by 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error('Error polling image status:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt"
        />
        <button type="submit" disabled={loading}>Generate Image</button>
      </form>
      {loading && <p>Checking job status...</p>}
      {jobStatus && (
        <div>
          <p>Job ID: {jobId}</p>
          <p>Status: {jobStatus.status}</p>
          {/* Display additional job status details here as needed */}
        </div>
      )}
      {imageSrc && <img src={imageSrc} alt="Generated" />}
    </div>
  );
};

export default ImageGenerator;