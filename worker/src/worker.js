export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean);
    const corsHeaders = buildCorsHeaders(origin, allowedOrigins);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/save-posts') {
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ message: 'Method Not Allowed' }, 405, corsHeaders);
    }

    const adminPassword = request.headers.get('X-Admin-Password') || '';
    if (!env.ADMIN_PASSWORD || adminPassword !== env.ADMIN_PASSWORD) {
      return jsonResponse({ message: 'Unauthorized' }, 401, corsHeaders);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return jsonResponse({ message: 'Invalid JSON' }, 400, corsHeaders);
    }

    if (!payload || !Array.isArray(payload.posts)) {
      return jsonResponse({ message: 'posts 배열이 필요합니다.' }, 400, corsHeaders);
    }

    try {
      const content = JSON.stringify({ posts: payload.posts }, null, 2);
      const commitMessage = payload.message || `Update posts.json (${new Date().toISOString().slice(0, 10)})`;
      const result = await savePostsToGithub(env, content, commitMessage);
      return jsonResponse(
        { message: 'ok', commit: result.commit, commitUrl: result.commitUrl },
        200,
        corsHeaders
      );
    } catch (error) {
      return jsonResponse({ message: error.message || 'GitHub update failed' }, 500, corsHeaders);
    }
  }
};

function buildCorsHeaders(origin, allowedOrigins) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password'
  };

  if (allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }

  return headers;
}

function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

async function savePostsToGithub(env, content, commitMessage) {
  const appJwt = await createAppJwt(env.GITHUB_APP_ID, env.GITHUB_APP_PRIVATE_KEY);
  const installationToken = await getInstallationToken(env, appJwt);
  const path = env.POSTS_PATH || 'posts.json';
  const { owner, repo, branch } = getRepoInfo(env);

  const existing = await getFileInfo({ owner, repo, path, branch, token: installationToken });
  const encoded = base64Encode(new TextEncoder().encode(content));

  const body = {
    message: commitMessage,
    content: encoded,
    branch
  };

  if (existing && existing.sha) {
    body.sha = existing.sha;
  }

  const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${installationToken}`,
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify(body)
  });

  if (!updateResponse.ok) {
    const text = await updateResponse.text();
    throw new Error(`GitHub update failed: ${updateResponse.status} ${text}`);
  }

  const result = await updateResponse.json();
  const commitSha = result.commit?.sha;
  const commitUrl = commitSha
    ? `https://github.com/${owner}/${repo}/commit/${commitSha}`
    : null;
  return { commit: commitSha, commitUrl };
}

async function getFileInfo({ owner, repo, path, branch, token }) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json'
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub read failed: ${response.status} ${text}`);
  }

  return response.json();
}

function getRepoInfo(env) {
  const owner = env.GITHUB_OWNER || 'catcatdo';
  const repo = env.GITHUB_REPO || 'catcatbuilder';
  const branch = env.GITHUB_BRANCH || 'main';
  return { owner, repo, branch };
}

async function getInstallationToken(env, appJwt) {
  if (!env.GITHUB_INSTALLATION_ID) {
    throw new Error('Missing GITHUB_INSTALLATION_ID');
  }

  const response = await fetch(`https://api.github.com/app/installations/${env.GITHUB_INSTALLATION_ID}/access_tokens`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${appJwt}`,
      'Accept': 'application/vnd.github+json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Installation token failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  if (!data.token) {
    throw new Error('Installation token missing in response');
  }

  return data.token;
}

async function createAppJwt(appId, privateKeyPem) {
  if (!appId || !privateKeyPem) {
    throw new Error('Missing GitHub App credentials');
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 600,
    iss: appId
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;

  const key = await importPrivateKey(privateKeyPem);
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(data)
  );

  const sigB64 = base64UrlEncodeBytes(new Uint8Array(signature));
  return `${data}.${sigB64}`;
}

async function importPrivateKey(pem) {
  const pemBody = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');

  const binary = base64Decode(pemBody);
  return crypto.subtle.importKey(
    'pkcs8',
    binary,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

function base64UrlEncode(value) {
  return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlEncodeBytes(bytes) {
  return base64Encode(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64Encode(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64Decode(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
