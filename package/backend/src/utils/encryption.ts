import { createCipheriv, createDecipheriv, hash, randomBytes } from 'crypto';
import { sign, verify } from 'jsonwebtoken';

// Function for generating a jwt for user authentication
export function createUserToken(id: string, hash: string) {
  try {
    // Sign the token with the user data
    return sign(
      {
        type: 'auth.user', // Authentication type
        id: id,
        hash: hash,
      },
      process.env.ENCRYPTION_JWT_SECRET ?? '',
    );
  } catch (e) {
    return null; // Return null if there was an error
  }
}

// Function for decoding and verifying a jwt for user session
export function decodeUserToken(token: string) {
  // Return null if no token is provided
  if (!token) return null;

  try {
    // Decode and verify the token against the secret
    const decoded: any = verify(token, process.env.ENCRYPTION_JWT_SECRET ?? '');

    // Return null if token is invalid or not of the correct type
    if (!decoded) return null;
    if (decoded.type !== 'auth.user') return null;

    // Return the decoded token
    return decoded;
  } catch (e) {
    // Return null if there was an error (eg. invalid token)
    return null;
  }
}

// Function for generating an encryption key derived from a password
export function getMailPasswordEncryptionKey(userId: string, password: string) {
  // Get SHA256 of the userId and password
  const key = hash('sha256', `${userId}$${password}`, 'hex');

  return key.toString();
}

// Function for encrypting a mailserver password using the derived key
export function encryptMailPassword(key: string, password: string) {
  // Create a random initialization vector
  const iv = randomBytes(16);

  // Convert the encryption key to a buffer and get the first 32 bytes
  const keyBuffer = Buffer.from(
    key.length === 64 ? key : hash('sha256', key, 'hex'),
    'hex',
  ).subarray(0, 32);

  // Cipher the password using AES-256-CBC and the derived key and IV
  const cipher = createCipheriv('aes-256-cbc', keyBuffer, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return the IV and encrypted password
  return iv.toString('hex') + ':' + encrypted;
}

// Function for decrypting a mailserver password using the derived key
export function decryptMailPassword(key: string, password: string) {
  try {
    // Check if the password is missing or does not contain a colon (delimiter for IV and encrypted password)
    if (!password || !password.includes(':')) return '';

    // Split the IV and encrypted text
    const [ivHex, encryptedText] = password.split(':', 2);
    if (!ivHex || !encryptedText) return '';

    // Convert the IV to a buffer
    const iv = Buffer.from(ivHex, 'hex');

    // Convert the encryption key to a buffer and get the first 32 bytes
    const keyBuffer = Buffer.from(
      key.length === 64 ? key : hash('sha256', key, 'hex'),
      'hex',
    ).subarray(0, 32);

    // Decipher the encrypted text using AES-256-CBC and the derived key and IV
    const decipher = createDecipheriv('aes-256-cbc', keyBuffer, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // Return the decrypted password
    return decrypted;
  } catch (error) {
    // Return an empty string if decryption fails
    return '';
  }
}
