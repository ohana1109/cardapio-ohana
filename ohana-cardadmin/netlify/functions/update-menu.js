const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // 1. Validate the request
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { ADMIN_SECRET, GITHUB_PAT } = process.env;
  const requestSecret = event.headers['admin-secret'];

  if (requestSecret !== ADMIN_SECRET) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  // 2. Prepare GitHub API details
  const owner = 'ohana1109';
  const repo = 'cardapio-ohana';
  const path = 'data/menu.json';
  const branch = 'main';
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  try {
    // 3. Get the current file SHA from GitHub
    const getFileResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!getFileResponse.ok && getFileResponse.status !== 404) {
      throw new Error(`Failed to fetch file SHA. Status: ${getFileResponse.status}`);
    }

    const fileData = await getFileResponse.json();
    // The SHA is needed for the update. It can be undefined if the file doesn't exist yet.
    const currentSha = fileData.sha;

    // 4. Prepare the new content
    const newContent = event.body;
    const encodedContent = Buffer.from(newContent).toString('base64');

    // 5. Commit the new file content to GitHub
    const updateResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: 'Atualiza cardápio via painel admin',
        content: encodedContent,
        sha: currentSha, // Include SHA to update the existing file
        branch: branch,
      }),
    });

    if (!updateResponse.ok) {
      const errorBody = await updateResponse.text();
      throw new Error(`Failed to update file. Status: ${updateResponse.status}. Body: ${errorBody}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Cardápio atualizado com sucesso!' }),
    };

  } catch (error) {
    console.error('Error updating file in GitHub:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao atualizar o cardápio.' }),
    };
  }
};
