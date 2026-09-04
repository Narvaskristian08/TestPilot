import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config/constants';
import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase';

export const isArtifactStorageConfigured = () => Boolean(
  isSupabaseConfigured() && CONFIG.SUPABASE_SERVICE_ROLE_KEY && CONFIG.SUPABASE_ARTIFACT_BUCKET
);

export const isRemoteArtifactPath = (filePath: string) => /^run-\d+\//.test(filePath);

/**
 * Upload an artifact to private Supabase Storage when configured. Local paths
 * remain supported for development and local fallback behavior.
 */
export async function persistArtifact(
  localPath: string,
  runId: number,
  contentType: string
): Promise<string> {
  if (!isArtifactStorageConfigured()) {
    return localPath;
  }

  const storagePath = `run-${runId}/${path.basename(localPath)}`;
  const file = await fs.promises.readFile(localPath);
  const { error } = await supabaseAdmin.storage
    .from(CONFIG.SUPABASE_ARTIFACT_BUCKET)
    .upload(storagePath, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return storagePath;
}

export async function createArtifactSignedUrl(filePath: string, download = false): Promise<string | null> {
  if (!isArtifactStorageConfigured() || !isRemoteArtifactPath(filePath)) {
    return null;
  }

  const { data, error } = await supabaseAdmin.storage
    .from(CONFIG.SUPABASE_ARTIFACT_BUCKET)
    .createSignedUrl(
      filePath,
      CONFIG.SUPABASE_ARTIFACT_SIGNED_URL_TTL_SECONDS,
      download ? { download: true } : undefined
    );

  if (error) {
    throw error;
  }

  return data?.signedUrl || null;
}

export async function removeStoredArtifacts(filePaths: string[]): Promise<void> {
  const remotePaths = filePaths.filter(isRemoteArtifactPath);
  if (!isArtifactStorageConfigured() || remotePaths.length === 0) {
    return;
  }

  const { error } = await supabaseAdmin.storage
    .from(CONFIG.SUPABASE_ARTIFACT_BUCKET)
    .remove(remotePaths);

  if (error) {
    throw error;
  }
}

export async function cleanupLocalArtifact(filePath: string): Promise<void> {
  if (isRemoteArtifactPath(filePath)) {
    return;
  }

  await fs.promises.unlink(filePath).catch(() => undefined);
}
