import db from '../config/database';
import { ARTIFACT_TYPES } from '../config/constants';

export interface TestArtifact {
  id?: number;
  result_id: number;
  artifact_type: keyof typeof ARTIFACT_TYPES;
  file_path: string;
  file_size?: number | null;
  created_at?: string;
}

export class TestArtifactModel {
  static create(artifact: Omit<TestArtifact, 'id' | 'created_at'>): TestArtifact {
    const stmt = db.prepare(`
      INSERT INTO test_artifacts (result_id, artifact_type, file_path, file_size)
      VALUES (@result_id, @artifact_type, @file_path, @file_size)
    `);

    const info = stmt.run({
      result_id: artifact.result_id,
      artifact_type: artifact.artifact_type,
      file_path: artifact.file_path,
      file_size: artifact.file_size || null,
    });

    return this.findById(info.lastInsertRowid as number)!;
  }

  static findById(id: number): TestArtifact | undefined {
    const stmt = db.prepare('SELECT * FROM test_artifacts WHERE id = ?');
    return stmt.get(id) as TestArtifact | undefined;
  }

  static findByResultId(resultId: number): TestArtifact[] {
    const stmt = db.prepare('SELECT * FROM test_artifacts WHERE result_id = ? ORDER BY created_at ASC');
    return stmt.all(resultId) as TestArtifact[];
  }

  static findByRunId(runId: number): TestArtifact[] {
    const stmt = db.prepare(`
      SELECT a.* FROM test_artifacts a
      INNER JOIN test_results r ON a.result_id = r.id
      WHERE r.run_id = ?
      ORDER BY a.created_at ASC
    `);
    return stmt.all(runId) as TestArtifact[];
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM test_artifacts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
