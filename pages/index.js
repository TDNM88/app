import React, { useState } from 'react';
import axios from 'axios';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [runningInfo, setRunningInfo] = useState(null);

  // Convert a hexadecimal string to a uint64 string
  const hexToUint64 = (hexString) => {
    const hexPrefixed = hexString.startsWith('0x') ? hexString : '0x' + hexString;
    const bigIntValue = BigInt(hexPrefixed);
    return bigIntValue.toString(10);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setImageSrc(null);
    setJobId(null);
    setRunningInfo(null);

    try {
      const response = await axios.post('/api/generate-image', { prompt });
      if (response.status === 200 && response.data.jobId) {
        // Convert the hexadecimal jobId to a uint64 string
        const jobIdUint64 = hexToUint64(response.data.jobId);
        setJobId(jobIdUint64);
        pollForImage(jobIdUint64);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setLoading(false);
    }
  };

  const pollForImage = (uint64JobId) => {
    const checkImageStatus = async (uint64JobId) => {
      try {
        const response = await axios.get(`/api/job/${uint64JobId}`);
        if (response.data && response.data.job && response.data.job.successInfo) {
          const successInfo = response.data.job.successInfo;
          if (successInfo.images && successInfo.images.length > 0) {
            const imageUrl = successInfo.images[0].url;
            setImageSrc(imageUrl);
            setLoading(false);
            return true;
          }
        }
        if (response.data && response.data.job && response.data.job.runningInfo) {
          setRunningInfo(response.data.job.runningInfo);
        }
      } catch (error) {
        console.error('Error checking image status:', error);
        setLoading(false);
      }
      return false;
    };

    const intervalId = setInterval(async () => {
      const isReady = await checkImageStatus(uint64JobId);
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
          placeholder="Enter your prompt"
        />
        <button type="submit" disabled={loading}>Generate Image</button>
      </form>
      {loading && <p>Generating image...</p>}
      {jobId && <p>Job ID: {jobId}</p>}
      {runningInfo && (
        <div>
          <p>Image is being processed...</p>
          <p>Processing Image Progress: {runningInfo.processingImages[0].progress}%</p>
        </div>
      )}
      {imageSrc && <img src={imageSrc} alt="Generated" />}
    </div>
  );
};

export default ImageGenerator;