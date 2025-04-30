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
