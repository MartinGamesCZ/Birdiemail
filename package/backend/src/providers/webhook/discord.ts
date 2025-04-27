import axios from 'axios';

// Function to send a message to a Discord webhook
export async function sendDiscordWebhook(message: string) {
  // Post to the Discord webhook URL with the message
  await axios.post(process.env.DISCORD_WEBHOOK_URL ?? '', {
    content: message,
  });
}
