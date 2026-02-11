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
  const branch = 'main';

  let filename, imageBody;
  try {
    const payload = JSON.parse(event.body);
    filename = payload.filename;
    // The image data is expected to be a Base64 string, but without the data URI prefix
    imageBody = payload.body.split(';base64,').pop();

    if (!filename || !imageBody) {
      throw new Error('Filename or image body not provided');
    }
  } catch(e) {
    return { statusCode: 400, body: 'Bad Request: Invalid JSON payload' };
  }

  const path = `assets/img/${filename}`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
    // 3. Commit the new image file to GitHub
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Upload de imagem: ${filename}`,
        content: imageBody, // The body is already Base64
        branch: branch,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to upload image. Status: ${response.status}. Body: ${errorBody}`);
    }

    const data = await response.json();
    
    // 4. Return the direct URL to the new image
    const imageUrl = data.content.download_url;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Imagem enviada com sucesso!', url: imageUrl }),
    };

  } catch (error) {
    console.error('Error uploading image to GitHub:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao enviar a imagem.' }),
    };
  }
};
