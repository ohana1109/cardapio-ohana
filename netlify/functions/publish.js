exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Pega URL da variável de ambiente do Netlify
  const buildHook = process.env.NETLIFY_BUILD_HOOK_URL;

  if (!buildHook) {
    return { statusCode: 500, body: JSON.stringify({ error: "Build Hook não configurado." }) };
  }

  try {
    const response = await fetch(buildHook, { method: 'POST' });
    if (response.ok) {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    } else {
      return { statusCode: response.status, body: JSON.stringify({ error: "Falha ao chamar Netlify." }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
