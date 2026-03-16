import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processPullRequest } from './git.js';
import { CopilotClient, approveAll } from '@github/copilot-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Copilot Client
const copilotClient = new CopilotClient();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.post('/api/review', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'PR URL is required' });
  }

  try {
    console.log(`Processing PR: ${url}`);
    const prDetails = await processPullRequest(url);
    
    console.log(`Getting Copilot review for PR: ${prDetails.prId}`);
    
    // Start client if not started
    if (copilotClient.getState() !== 'connected') {
        await copilotClient.start();
    }
    
    const session = await copilotClient.createSession({
      model: "gpt-4", // Use default or specific model
      onPermissionRequest: approveAll
    });
    
    const prompt = `Code Review Request\n\nPlease review the following unified Git diff for a Pull Request from ${prDetails.owner}/${prDetails.repoName}.\n\nDiff:\n\`\`\`diff\n${prDetails.diff}\n\`\`\`\n\nProvide a comprehensive code review highlighting bugs, security issues, performance concerns, and overall code quality. Keep it constructive and formatted in Markdown.`;

    const response = await session.sendAndWait({ prompt });
    
    await session.disconnect();

    res.json({ 
      success: true, 
      review: response?.data.content || "No review generated",
      details: { owner: prDetails.owner, repo: prDetails.repoName, prId: prDetails.prId }
    });
  } catch (error: any) {
    console.error('Error processing PR:', error);
    res.status(500).json({ error: error.message || 'An error occurred during PR review' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
