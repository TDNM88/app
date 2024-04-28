import React, { useState } from 'react';
import axios from 'axios';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [runningInfo, setRunningInfo] = useState(null); // State variable to store runningInfo

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setImageSrc(null);
    setJobId(null);
    setRunningInfo(null); // Reset the runningInfo

    try {
      const response = await axios.post('/api/generate-image', { prompt });
      if (response.status === 200 && response.data.jobId) {
        setJobId(response.data.jobId);
        pollForImage(response.data.jobId);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false);
    }
  };

  const pollForImage = (jobId) => {
    const checkImageStatus = async (jobId) => {
      try {
        const response = await axios.get(`/api/job/${jobId}`);

        // Update runningInfo with the latest data from the server
        if (response.data && response.data.job && response.data.job.runningInfo) {
          setRunningInfo(response.data.job.runningInfo);
        }

        // Check if the job has been successfully completed and an image is available
        if (response.data && response.data.job && response.data.job.successInfo) {
          const successInfo = response.data.job.successInfo;
          if (successInfo.images && successInfo.images.length > 0) {
            const imageUrl = successInfo.images[0].url;
            setImageSrc(imageUrl);
            setLoading(false);
            return true;
          }
        }
      } catch (error) {
        console.error('Error checking image status:', error);
        setLoading(false);
      }
      return false;
    };

    const intervalId = setInterval(async () => {
      const isReady = await checkImageStatus(jobId);
      if (isReady) {
        clearInterval(intervalId);
      }
    }, 3000);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button type="submit">Generate Image</button>
      </form>
      {loading && <p>Generating image...</p>}
      {runningInfo && (
        <div>
          <p>Image is being processed...</p>
          {/* Display runningInfo details */}
          <p>Processing Image Progress: {runningInfo.processingImages[0].progress}%</p>
        </div>
      )}
      {jobId && <p>Job ID: {jobId}</p>}
      {imageSrc && <img src={imageSrc} alt="Generated" />}
    </div>
  );
};

export default ImageGenerator;