export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean);
    const corsHeaders = buildCorsHeaders(origin, allowedOrigins);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (url.pathname === '/most-active-stocks') {
      if (request.method !== 'GET') {
        return jsonResponse({ message: 'Method Not Allowed' }, 405, corsHeaders);
      }
      try {
        const [us, kr] = await Promise.all([
          fetchNewsHotStocks(env, 'us', 'ko', getUsCompanies()),
          fetchNewsHotStocks(env, 'kr', 'ko', getKrCompanies())
        ]);
        return jsonResponse({ us, kr }, 200, corsHeaders);
      } catch (error) {
        return jsonResponse({ message: 'Failed to load stocks' }, 500, corsHeaders);
      }
    }

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
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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

async function fetchNewsHotStocks(env, country, language, companies) {
  const key = env.NEWSDATA_API_KEY;
  if (!key) throw new Error('Missing NEWSDATA_API_KEY');

  const url = new URL('https://newsdata.io/api/1/news');
  url.searchParams.set('apikey', key);
  url.searchParams.set('country', country);
  url.searchParams.set('language', language);
  url.searchParams.set('category', 'business');
  url.searchParams.set('page', '1');

  const response = await fetch(url.toString());
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NewsData fetch failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const items = Array.isArray(data.results) ? data.results : [];
  const scores = new Map();

  items.forEach(article => {
    const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
    companies.forEach(company => {
      const matched = company.aliases.some(alias => text.includes(alias));
      if (matched) {
        scores.set(company.symbol, (scores.get(company.symbol) || 0) + 1);
      }
    });
  });

  const ranked = companies
    .map(company => ({
      ...company,
      score: scores.get(company.symbol) || 0
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const symbols = ranked.map(item => item.symbol);
  const quoteMap = await fetchYahooQuotes(symbols);

  return ranked.map(item => {
    const quote = quoteMap[item.symbol] || {};
    return {
      symbol: item.symbol,
      name: item.name,
      price: quote.regularMarketPrice ?? null,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0
    };
  });
}

function getUsCompanies() {
  return [
    { symbol: 'AAPL', name: 'Apple', aliases: ['apple', '아이폰', '애플'] },
    { symbol: 'MSFT', name: 'Microsoft', aliases: ['microsoft', 'windows', '마이크로소프트'] },
    { symbol: 'NVDA', name: 'NVIDIA', aliases: ['nvidia', '엔비디아'] },
    { symbol: 'AMZN', name: 'Amazon', aliases: ['amazon', '아마존', 'aws'] },
    { symbol: 'GOOGL', name: 'Alphabet', aliases: ['google', 'alphabet', '구글'] },
    { symbol: 'TSLA', name: 'Tesla', aliases: ['tesla', '테슬라'] },
    { symbol: 'META', name: 'Meta', aliases: ['meta', 'facebook', '메타'] },
    { symbol: 'NFLX', name: 'Netflix', aliases: ['netflix', '넷플릭스'] },
    { symbol: 'AMD', name: 'AMD', aliases: ['amd', '라이젠'] },
    { symbol: 'INTC', name: 'Intel', aliases: ['intel', '인텔'] }
  ].map(item => ({ ...item, aliases: item.aliases.map(a => a.toLowerCase()) }));
}

function getKrCompanies() {
  return [
    { symbol: '005930.KS', name: '삼성전자', aliases: ['삼성전자', 'samsung electronics'] },
    { symbol: '000660.KS', name: 'SK하이닉스', aliases: ['sk하이닉스', 'sk hynix'] },
    { symbol: '035420.KS', name: 'NAVER', aliases: ['naver', '네이버'] },
    { symbol: '035720.KS', name: '카카오', aliases: ['kakao', '카카오'] },
    { symbol: '051910.KS', name: 'LG화학', aliases: ['lg화학', 'lg chem'] },
    { symbol: '068270.KS', name: '셀트리온', aliases: ['셀트리온', 'celltrion'] },
    { symbol: '005380.KS', name: '현대차', aliases: ['현대차', 'hyundai motor'] },
    { symbol: '207940.KS', name: '삼성바이오로직스', aliases: ['삼성바이오로직스', 'samsung biolo'] },
    { symbol: '105560.KS', name: 'KB금융', aliases: ['kb금융', 'kb financial'] },
    { symbol: '323410.KS', name: '카카오뱅크', aliases: ['카카오뱅크', 'kakaobank'] }
  ].map(item => ({ ...item, aliases: item.aliases.map(a => a.toLowerCase()) }));
}

async function fetchYahooQuotes(symbols) {
  if (!symbols.length) return {};
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`;
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Yahoo quote failed: ${response.status} ${text}`);
  }
  const data = await response.json();
  const list = data.quoteResponse?.result || [];
  const map = {};
  list.forEach(item => {
    if (item && item.symbol) {
      map[item.symbol] = item;
    }
  });
  return map;
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
