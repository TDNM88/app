// pages/api/job/[jobId].js
import axios from 'axios';

const TAMS_JOB_STATUS_ENDPOINT = 'https://ap-east-1.tensorart.cloud/v1/jobs';

async function fetchJobInfo(jobId) {
  const headers = {
    'Authorization': `Bearer ${process.env.TAMS_API_KEY}`,
    'x-app-id': process.env.TAMS_APP_ID
  };

  const response = await axios.get(`${TAMS_JOB_STATUS_ENDPOINT}/${jobId}`, { headers });
  return response.data;
}

export default async (req, res) => {
  if (req.method === 'GET') {
    const { jobId } = req.query;

    try {
      const jobInfo = await fetchJobInfo(jobId);

      if (!jobInfo) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Extract the relevant information based on the job's status
      if (jobInfo.job && jobInfo.job.status === 'completed' && jobInfo.job.successInfo) {
        // Assuming the first image is the one we want
        const imageUrl = jobInfo.job.successInfo.images[0].url;
        return res.status(200).json({ imageUrl });
      } else if (jobInfo.job && jobInfo.job.runningInfo) {
        // Return runningInfo if the job is still in progress
        const runningInfo = jobInfo.job.runningInfo;
        return res.status(200).json({ runningInfo });
      } else {
        // Return the entire job object if the status is not 'completed' or 'running'
        return res.status(200).json({ job: jobInfo.job });
      }

    } catch (error) {
      console.error('Error fetching job info:', error);
      return res.status(500).json({ message: 'Error fetching job info', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};