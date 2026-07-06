#!/usr/bin/env node
// Uploads a file to the Cloudflare R2 bucket used for ClerkTree marketing media,
// refusing the upload if it would push the bucket over the configured size cap.
//
// Usage: node scripts/r2-upload.mjs <local-file-path> [remote-key]
//
// Required env vars (put these in .env, never commit them):
//   CF_ACCOUNT_ID   - Cloudflare account ID
//   CF_API_TOKEN    - Cloudflare API token with R2 edit permission on the bucket
//   R2_BUCKET_NAME  - target R2 bucket name
// Optional:
//   R2_SIZE_CAP_BYTES - hard cap for total bucket size (default: 9.5 GB, leaving
//                        headroom under a 10 GB plan/trial limit)

import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_CAP_BYTES = Math.floor(9.5 * 1024 * 1024 * 1024); // 9.5 GB

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const SIZE_CAP_BYTES = process.env.R2_SIZE_CAP_BYTES
  ? Number(process.env.R2_SIZE_CAP_BYTES)
  : DEFAULT_CAP_BYTES;

function contentTypeFor(filename) {
  const ext = path.extname(filename).toLowerCase();
  return (
    {
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    }[ext] || 'application/octet-stream'
  );
}

async function getBucketTotalBytes() {
  const base = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects`;
  let cursor;
  let total = 0;

  do {
    const url = new URL(base);
    url.searchParams.set('per_page', '1000');
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(`Failed to list R2 objects: ${JSON.stringify(json.errors)}`);
    }
    for (const obj of json.result) total += obj.size;
    cursor = json.result_info?.cursor || null;
  } while (cursor);

  return total;
}

async function main() {
  const [, , localPath, remoteKeyArg] = process.argv;

  if (!localPath) {
    console.error('Usage: node scripts/r2-upload.mjs <local-file-path> [remote-key]');
    process.exit(1);
  }
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN || !R2_BUCKET_NAME) {
    console.error('Missing CF_ACCOUNT_ID, CF_API_TOKEN, or R2_BUCKET_NAME env vars.');
    process.exit(1);
  }

  const remoteKey = remoteKeyArg || path.basename(localPath);
  const fileStat = await stat(localPath);

  console.log(`Checking current bucket usage before uploading "${remoteKey}" (${fileStat.size} bytes)...`);
  const currentTotal = await getBucketTotalBytes();
  const projectedTotal = currentTotal + fileStat.size;

  console.log(
    `Current bucket size: ${(currentTotal / 1024 / 1024).toFixed(1)} MB, ` +
      `after upload: ${(projectedTotal / 1024 / 1024).toFixed(1)} MB, ` +
      `cap: ${(SIZE_CAP_BYTES / 1024 / 1024).toFixed(1)} MB`,
  );

  if (projectedTotal > SIZE_CAP_BYTES) {
    console.error(
      `Refusing upload: this would push the bucket to ${(projectedTotal / 1024 / 1024 / 1024).toFixed(2)} GB, ` +
        `over the ${(SIZE_CAP_BYTES / 1024 / 1024 / 1024).toFixed(2)} GB cap. Upload aborted, no cost risk taken.`,
    );
    process.exit(2);
  }

  const fileBuffer = await readFile(localPath);
  const encodedKey = remoteKey.split('/').map(encodeURIComponent).join('/');
  const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects/${encodedKey}`;

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      'Content-Type': contentTypeFor(remoteKey),
    },
    body: fileBuffer,
  });
  const json = await res.json();

  if (!json.success) {
    console.error(`Upload failed: ${JSON.stringify(json.errors)}`);
    process.exit(1);
  }

  console.log(`Uploaded "${remoteKey}" successfully.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
