import { db } from '../config/database';
import { ARTIFACT_TYPES } from '../config/constants';

export interface TestArtifact {
  id: number;
  result_id: number;
  run_id: number;
  artifact_type: keyof typeof ARTIFACT_TYPES;
  file_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  created_at?: string;
}

export class TestArtifactModel {
  static async create(artifact: Omit<TestArtifact, 'id' | 'created_at'>): Promise<TestArtifact> {
    return await db.createTestArtifact({
      result_id: artifact.result_id,
      run_id: artifact.run_id,
      artifact_type: artifact.artifact_type,
      file_path: artifact.file_path,
      file_size: artifact.file_size || null,
      mime_type: artifact.mime_type || null,
    });
  }

  static async findById(id: number): Promise<TestArtifact | null> {
    const { data, error } = await db.supabaseDb
      .from('test_artifacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as TestArtifact;
  }

  static async findByResultId(resultId: number): Promise<TestArtifact[]> {
    const { data, error } = await db.supabaseDb
      .from('test_artifacts')
      .select('*')
      .eq('result_id', resultId)
      .order('created_at', { ascending: true });

    if (error) return [];
    return data as TestArtifact[];
  }

  static async findByRunId(runId: number): Promise<TestArtifact[]> {
    return await db.getTestArtifacts(runId);
  }

  static async delete(id: number): Promise<boolean> {
    const { error } = await db.supabaseDb
      .from('test_artifacts')
      .delete()
      .eq('id', id);

    return !error;
  }
}
