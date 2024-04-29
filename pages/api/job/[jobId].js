// pages/api/job/[jobId].js
import axios from 'axios';

// This is the handler for the /api/job/[jobId] endpoint
export default async function handler(req, res) {
  // Check if the request method is GET
  if (req.method === 'GET') {
    try {
      // Extract the jobId from the query parameters
      const { jobId } = req.query;

      // Log the incoming request for the jobId (optional)
      console.log(`Fetching status for job ID: ${jobId}`);

      // Define the endpoint for the external API that provides the job status
      const TAMS_JOB_STATUS_ENDPOINT = `https://ap-east-1.tensorart.cloud/v1/jobs/${jobId}`;

      // Set up the headers for the external API request
      const headers = {
        'Authorization': `Bearer ${process.env.TAMS_API_KEY}`, // Replace with your actual API key
        'x-app-id': process.env.TAMS_APP_ID, // Replace with your actual App ID
      };

      // Make a GET request to the external API to fetch the job status
      const response = await axios.get(TAMS_JOB_STATUS_ENDPOINT, { headers });

      // If the response is successful, send the job status data back to the client
      res.status(200).json(response.data);
    } catch (error) {
      // If there's an error, log it and send a 500 Internal Server Error response
      console.error('Error fetching job status:', error);
      res.status(500).json({ message: 'Error fetching job status', error: error.message });
    }
  } else {
    // If the request method is not GET, return a 405 Method Not Allowed error
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}