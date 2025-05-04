export function parseInternalHeaders(headers: Record<string, string>) {
  if (headers['X-Mailer'] != 'Birdiemail') return {};

  return {
    client: headers['X-Birdie-Client'],
    sender: {
      userId: headers['X-Birdie-User-ID'],
      accountId: headers['X-Birdie-Account-ID'],
    },
    scheduledAt: headers['X-Birdie-Scheduled-At'],
  };
}

export function parseMailHeaders(headers: string): Record<string, string> {
  const lines = headers.split('\r\n');

  const parsedHeaders: Record<string, string> = {};

  let currentKey = '';
  let buf = '';

  for (const line of lines) {
    if (line.startsWith(' ')) buf += line.trim();
    else {
      if (currentKey.length > 0) {
        parsedHeaders[currentKey] = buf;
      }

      const [key, value] = line.split(': ');

      currentKey = key.trim();
      buf = value ? value.trim() : '';
    }
  }

  return parsedHeaders;
}
