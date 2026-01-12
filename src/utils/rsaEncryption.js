import JSEncrypt from 'jsencrypt';

let cachedPublicKey = null;
let publicKeyFetchPromise = null;

export const fetchPublicKey = async apiGet => {
  if (cachedPublicKey) return cachedPublicKey;

  if (publicKeyFetchPromise) return publicKeyFetchPromise;

  publicKeyFetchPromise = (async () => {
    try {
      const response = await apiGet('/auth-service/auth/public-key');

      if (response?.publicKey) {
        cachedPublicKey = response.publicKey;
        return cachedPublicKey;
      } else {
        // Clear cache on failure
        cachedPublicKey = null;
        throw new Error('Public key not found in response');
      }
    } catch (error) {
      // Clear cache on error to force refresh
      cachedPublicKey = null;
      publicKeyFetchPromise = null;
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch encryption key. Please try again.');
    }
  })();

  return publicKeyFetchPromise;
};

export const encryptPassword = async (password, apiGet) => {
  if (!password) throw new Error('Password cannot be empty');

  try {
    const publicKey = await fetchPublicKey(apiGet);

    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);

    const encrypted = encrypt.encrypt(password);

    if (!encrypted) throw new Error('Encryption failed. Please try again.');

    return encrypted;
  } catch (error) {
    console.error('Password encryption error:', error);
    throw error;
  }
};

export const clearPublicKeyCache = () => {
  cachedPublicKey = null;
  publicKeyFetchPromise = null;
};
