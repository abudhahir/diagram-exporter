import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPOS_DIR = path.join(__dirname, '..', 'repos');

export async function processPullRequest(url: string) {
  let owner = '', repoName = '', prId = '';
  let provider = '';

  const githubMatch = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  const gitlabMatch = url.match(/gitlab\.com\/([^/]+)\/([^/]+)\/-\/merge_requests\/(\d+)/);

  if (githubMatch) {
    [, owner, repoName, prId] = githubMatch;
    provider = 'github';
  } else if (gitlabMatch) {
    [, owner, repoName, prId] = gitlabMatch;
    provider = 'gitlab';
  } else {
    throw new Error('Invalid or unsupported PR URL format. Only GitHub PRs and GitLab MRs are currently supported.');
  }

  console.log(`Extracting exact diff via ${provider} API...`);
  let diff = '';

  try {
    if (provider === 'github') {
      try {
        // GitHub provides a clean .diff application/vnd.github.v3.diff format
        const res = await axios.get<string>(`https://api.github.com/repos/${owner}/${repoName}/pulls/${prId}`, {
          headers: { Accept: 'application/vnd.github.v3.diff' }
        });
        diff = res.data;
        console.log(`GitHub API Response status: ${res.status}`);
        console.log(`GitHub API Response data typeof: ${typeof diff}`);
      } catch (githubErr: any) {
        if (githubErr.response?.status === 406) {
           console.log("Diff too large for direct .diff endpoint (406), attempting to fetch files individually as fallback...");
           const filesRes = await axios.get<any[]>(`https://api.github.com/repos/${owner}/${repoName}/pulls/${prId}/files?per_page=100`);
           
           const patches = filesRes.data
              .map((file) => file.patch ? `--- a/${file.filename}\n+++ b/${file.filename}\n${file.patch}` : '')
              .filter(p => p.length > 0);
              
           diff = patches.join('\n\n');
           
           if (filesRes.data.length === 100) {
              diff += '\n\n... (WARNING: Diff truncated, showing first 100 files. PR is too large.)';
           }
        } else {
           throw githubErr;
        }
      }
    } else {
      // GitLab provides a /changes endpoint
      const res = await axios.get<{ changes: any[] }>(`https://gitlab.com/api/v4/projects/${owner}%2F${repoName}/merge_requests/${prId}/changes`);
      const changes = res.data.changes;
      diff = changes.map((c: any) => c.diff).join('\n\n');
    }
  } catch (e: any) {
     console.error('Failed to fetch diff from API API:', e.message);
     throw new Error(`Failed to extract diff natively from ${provider} API. ${e.message}`);
  }

  if (!diff || diff.trim() === '') {
     throw new Error(`The diff provided for this PR is truly empty on the provider side.`);
  }

  console.log(`Diff fetched successfully via API with length: ${diff.length}`);
  
  // Truncate extreme diffs to prevent Copilot SDK timeouts (limit ~5,000 characters)
  const MAX_DIFF_LENGTH = 5000;
  if (diff.length > MAX_DIFF_LENGTH) {
      console.log(`Truncating diff from ${diff.length} to ${MAX_DIFF_LENGTH} characters.`);
      diff = diff.substring(0, MAX_DIFF_LENGTH) + '\n\n... (WARNING: Diff truncated due to size limits. Review may be incomplete.)';
  }
  
  return {
    owner,
    repoName,
    prId,
    diff,
    worktreePath: 'API_FETCHED'
  };
}
