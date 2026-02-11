
exports.handler = async function(event, context) {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const owner = 'ohana1109';
  const repo = 'cardapio-ohana';
  const path = 'data/menu.json';
  const branch = 'main';
  
  const GITHUB_PAT = process.env.GITHUB_PAT;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      // Handle case where file might not exist or other API errors
      if (response.status === 404) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [] }), // Return empty menu if file not found
        };
      }
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Content is Base64 encoded
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: content,
    };

  } catch (error) {
    console.error('Error fetching from GitHub:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch menu data' }),
    };
  }
};
