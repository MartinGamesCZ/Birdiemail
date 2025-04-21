import axios from 'axios';

export async function sendDiscordWebhook(message: string) {
  await axios.post(process.env.DISCORD_WEBHOOK_URL ?? '', {
    content: message,
  });
}
