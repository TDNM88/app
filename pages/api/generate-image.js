// pages/api/generate-image.js
import axios from 'axios';
import crypto from 'crypto';

export default async (req, res) => {
  if (req.method === 'POST') {
    const { prompt } = req.body;
    const TAMS_API_ENDPOINT = 'https://ap-east-1.tensorart.cloud/v1/jobs';

    // Create a random and secure requestId
    const requestId = crypto.randomBytes(16).toString('hex');

    const tamsRequestBody = {
      requestId: requestId,
      stages: [
        {
          "type": "INPUT_INITIALIZE",
          "inputInitialize": {
            "seed": -1,
            "count": 2
          }
        },
        {
          type: "DIFFUSION",
          diffusion: {
            width: 512,
            height: 512,
            prompts: [{ text: prompt }],
            negativePrompts: [],
            sampler: "DPM++ 2M Karras",
            sdVae: "Automatic",
            steps: 15,
            sd_model: "600423083519508503",
            clip_skip: 2,
            cfg_scale: 7
          }
        }
      ]
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TAMS_API_KEY}`,
      'x-app-id': process.env.TAMS_APP_ID
    };

    try {
      const tamsResponse = await axios.post(TAMS_API_ENDPOINT, tamsRequestBody, { headers });

      // Wait 30 seconds before checking the URL again
      setTimeout(async () => {
        try {
          const jobResponse = await axios.get(`/api/job/${requestId}`);
          const imageUrl = jobResponse.data?.job?.successInfo?.images?.[0]?.url;

          if (imageUrl) {
            res.status(200).json({ imageUrl });
          } else {
            res.status(503).json({ message: 'Timeout waiting for imageUrl' });
          }
        } catch (error) {
          console.error('Error calling Tams API:', error);
          res.status(500).json({ message: 'Error calling Tams API', error: error.message });
        }
      }, 60000); // Wait 60 seconds (300006milliseconds)
    } catch (error) {
      console.error('Error calling Tams API:', error);
      res.status(500).json({ message: 'Error calling Tams API', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};