import { Response, Router } from 'express';
import path from 'path';
import { db, isSupabaseConfigured } from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

type Owner = string | null;
type Row = Record<string, any>;

const CASE_TYPES = new Set([
  'AVAILABILITY',
  'LINK_TEST',
  'BUTTON_TEST',
  'FORM_TEST',
  'RESPONSIVE',
  'CONSOLE_ERRORS',
  'ACCESSIBILITY',
  'SECURITY',
  'PERFORMANCE',
]);

function ownerFor(req: AuthRequest): Owner {
  if (req.user?.id) return req.user.id;
  if (isSupabaseConfigured()) {
    throw new AppError('Authentication required for management data', 401);
  }
  return null;
}

function idFrom(value: string | undefined): number {
  if (!value || !/^\d+$/.test(value)) throw new AppError('Invalid resource id', 400);
  return Number.parseInt(value, 10);
}

function requiredText(value: unknown, field: string, maxLength = 200): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(`${field} is required`, 400);
  }
  const result = value.trim();
  if (result.length > maxLength) throw new AppError(`${field} is too long`, 400);
  return result;
}

function optionalText(value: unknown, field: string, maxLength = 5000): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') throw new AppError(`${field} must be text`, 400);
  const result = value.trim();
  if (result.length > maxLength) throw new AppError(`${field} is too long`, 400);
  return result || null;
}

function optionalNumber(value: unknown, field: string): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new AppError(`${field} must be a positive integer`, 400);
  return parsed;
}

function scopedQuery(table: string, owner: Owner, select = '*'): any {
  const query = db.supabaseDb.from(table).select(select);
  return owner ? query.eq('user_id', owner) : query.or('user_id.is.null');
}

function scopedRowQuery(table: string, id: number, owner: Owner, select = '*'): any {
  const query = db.supabaseDb.from(table).select(select).eq('id', id);
  return owner ? query.eq('user_id', owner) : query.or('user_id.is.null');
}

async function findScoped(table: string, id: number, owner: Owner): Promise<Row | null> {
  const { data, error } = await scopedRowQuery(table, id, owner).single();
  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data as Row;
}

async function requireScoped(table: string, id: number, owner: Owner): Promise<Row> {
  const row = await findScoped(table, id, owner);
  if (!row) throw new AppError('Resource not found', 404);
  return row;
}

async function ensureSuite(suiteId: number | null | undefined, owner: Owner): Promise<void> {
  if (suiteId === undefined || suiteId === null) return;
  await requireScoped('test_suites', suiteId, owner);
}

async function refreshSuiteCount(suiteId: number | null | undefined, owner: Owner): Promise<void> {
  if (suiteId === undefined || suiteId === null) return;
  let query = db.supabaseDb.from('test_cases').select('*', { count: 'exact', head: true }).eq('suite_id', suiteId);
  query = owner ? query.eq('user_id', owner) : query.or('user_id.is.null');
  const { count, error } = await query;
  if (error) throw error;
  await update('test_suites', suiteId, owner, { test_count: count || 0, updated_at: new Date().toISOString() });
}

async function write(table: string, payload: Row): Promise<Row> {
  const { data, error } = await db.supabaseDb.from(table).insert(payload).select().single();
  if (error) throw error;
  return data as Row;
}

async function update(table: string, id: number, owner: Owner, payload: Row): Promise<Row> {
  const query = db.supabaseDb.from(table).update(payload).eq('id', id);
  const scoped = owner ? query.eq('user_id', owner) : query.or('user_id.is.null');
  const { data, error } = await scoped.select().single();
  if (error?.code === 'PGRST116') throw new AppError('Resource not found', 404);
  if (error) throw error;
  return data as Row;
}

async function remove(table: string, id: number, owner: Owner): Promise<void> {
  await requireScoped(table, id, owner);
  const query = db.supabaseDb.from(table).delete().eq('id', id);
  const scoped = owner ? query.eq('user_id', owner) : query.or('user_id.is.null');
  const { error } = await scoped;
  if (error) throw error;
}

function response(res: Response, data: unknown, status = 200): void {
  res.status(status).json({ success: true, data });
}

router.use(optionalAuth);

// Suites
router.get('/suites', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const { data, error } = await scopedQuery('test_suites', owner).order('created_at', { ascending: false });
  if (error) throw error;
  response(res, data || []);
}));

router.post('/suites', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const suite = await write('test_suites', {
    user_id: owner,
    name: requiredText(req.body?.name, 'Suite name'),
    description: optionalText(req.body?.description, 'Description'),
    test_count: 0,
  });
  response(res, suite, 201);
}));

router.get('/suites/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  response(res, await requireScoped('test_suites', idFrom(req.params.id), ownerFor(req)));
}));

router.patch('/suites/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const payload: Row = {};
  if (req.body?.name !== undefined) payload.name = requiredText(req.body.name, 'Suite name');
  if (req.body?.description !== undefined) payload.description = optionalText(req.body.description, 'Description');
  if (Object.keys(payload).length === 0) throw new AppError('No suite changes supplied', 400);
  payload.updated_at = new Date().toISOString();
  response(res, await update('test_suites', idFrom(req.params.id), ownerFor(req), payload));
}));

router.delete('/suites/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await remove('test_suites', idFrom(req.params.id), ownerFor(req));
  response(res, { deleted: true });
}));

// Test cases
router.get('/cases', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const suiteId = req.query.suiteId ? optionalNumber(req.query.suiteId, 'suiteId') : undefined;
  let query = scopedQuery('test_cases', owner);
  if (suiteId) query = query.eq('suite_id', suiteId);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  response(res, data || []);
}));

router.post('/cases', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const suiteId = optionalNumber(req.body?.suite_id ?? req.body?.suiteId, 'suite_id');
  await ensureSuite(suiteId, owner);
  const type = requiredText(req.body?.type, 'Test type', 50).toUpperCase();
  if (!CASE_TYPES.has(type)) throw new AppError(`Unsupported test type: ${type}`, 400);
  const testCase = await write('test_cases', {
    user_id: owner,
    suite_id: suiteId ?? null,
    name: requiredText(req.body?.name, 'Test case name'),
    type,
    description: optionalText(req.body?.description, 'Description'),
    config: req.body?.config ?? null,
    status: req.body?.status === 'inactive' ? 'inactive' : 'active',
  });
  await refreshSuiteCount(suiteId, owner);
  response(res, testCase, 201);
}));

router.get('/cases/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  response(res, await requireScoped('test_cases', idFrom(req.params.id), ownerFor(req)));
}));

router.patch('/cases/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const current = await requireScoped('test_cases', idFrom(req.params.id), owner);
  const payload: Row = {};
  if (req.body?.name !== undefined) payload.name = requiredText(req.body.name, 'Test case name');
  if (req.body?.type !== undefined) {
    payload.type = requiredText(req.body.type, 'Test type', 50).toUpperCase();
    if (!CASE_TYPES.has(payload.type)) throw new AppError(`Unsupported test type: ${payload.type}`, 400);
  }
  if (req.body?.description !== undefined) payload.description = optionalText(req.body.description, 'Description');
  if (req.body?.config !== undefined) payload.config = req.body.config;
  if (req.body?.status !== undefined) {
    if (req.body.status !== 'active' && req.body.status !== 'inactive') throw new AppError('Invalid case status', 400);
    payload.status = req.body.status;
  }
  if (req.body?.suite_id !== undefined || req.body?.suiteId !== undefined) {
    payload.suite_id = optionalNumber(req.body.suite_id ?? req.body.suiteId, 'suite_id');
    await ensureSuite(payload.suite_id, owner);
  }
  if (Object.keys(payload).length === 0) throw new AppError('No test case changes supplied', 400);
  payload.updated_at = new Date().toISOString();
  const updated = await update('test_cases', current.id, owner, payload);
  await refreshSuiteCount(current.suite_id, owner);
  await refreshSuiteCount(updated.suite_id, owner);
  response(res, updated);
}));

router.delete('/cases/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const current = await requireScoped('test_cases', idFrom(req.params.id), owner);
  await remove('test_cases', current.id, owner);
  await refreshSuiteCount(current.suite_id, owner);
  response(res, { deleted: true });
}));

// Schedules are persisted locally/hosted. Execution is intentionally kept
// separate from this CRUD API because the current worker is single-instance.
router.get('/schedules', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const { data, error } = await scopedQuery('schedules', owner).order('created_at', { ascending: false });
  if (error) throw error;
  response(res, data || []);
}));

router.post('/schedules', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const suiteId = optionalNumber(req.body?.suite_id ?? req.body?.suiteId, 'suite_id');
  await ensureSuite(suiteId, owner);
  const schedule = await write('schedules', {
    user_id: owner,
    suite_id: suiteId ?? null,
    name: requiredText(req.body?.name, 'Schedule name'),
    cron_expression: requiredText(req.body?.cron_expression ?? req.body?.cron, 'Cron expression', 120),
    timezone: requiredText(req.body?.timezone || 'UTC', 'Timezone', 80),
    enabled: req.body?.enabled !== false,
  });
  response(res, schedule, 201);
}));

router.patch('/schedules/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const payload: Row = {};
  if (req.body?.name !== undefined) payload.name = requiredText(req.body.name, 'Schedule name');
  if (req.body?.cron_expression !== undefined || req.body?.cron !== undefined) {
    payload.cron_expression = requiredText(req.body.cron_expression ?? req.body.cron, 'Cron expression', 120);
  }
  if (req.body?.timezone !== undefined) payload.timezone = requiredText(req.body.timezone, 'Timezone', 80);
  if (req.body?.enabled !== undefined) {
    if (typeof req.body.enabled !== 'boolean') throw new AppError('enabled must be boolean', 400);
    payload.enabled = req.body.enabled;
  }
  if (req.body?.suite_id !== undefined || req.body?.suiteId !== undefined) {
    payload.suite_id = optionalNumber(req.body.suite_id ?? req.body.suiteId, 'suite_id');
    await ensureSuite(payload.suite_id, owner);
  }
  if (Object.keys(payload).length === 0) throw new AppError('No schedule changes supplied', 400);
  payload.updated_at = new Date().toISOString();
  response(res, await update('schedules', idFrom(req.params.id), owner, payload));
}));

router.post('/schedules/:id/toggle', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const schedule = await requireScoped('schedules', idFrom(req.params.id), owner);
  response(res, await update('schedules', schedule.id, owner, {
    enabled: !Boolean(schedule.enabled),
    updated_at: new Date().toISOString(),
  }));
}));

router.delete('/schedules/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await remove('schedules', idFrom(req.params.id), ownerFor(req));
  response(res, { deleted: true });
}));

// Environments
router.get('/environments', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const { data, error } = await scopedQuery('environments', owner).order('created_at', { ascending: false });
  if (error) throw error;
  response(res, data || []);
}));

function environmentPayload(body: Row): Row {
  const url = requiredText(body.url, 'Environment URL', 2000);
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new AppError('Environment URL must be valid', 400); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new AppError('Environment URL must use HTTP or HTTPS', 400);
  const type = body.type || 'development';
  if (!['development', 'staging', 'production'].includes(type)) throw new AppError('Invalid environment type', 400);
  const status = body.status || 'active';
  if (!['active', 'inactive'].includes(status)) throw new AppError('Invalid environment status', 400);
  return {
    name: requiredText(body.name, 'Environment name'),
    url,
    type,
    status,
    description: optionalText(body.description, 'Description'),
  };
}

router.post('/environments', asyncHandler(async (req: AuthRequest, res: Response) => {
  response(res, await write('environments', { ...environmentPayload(req.body || {}), user_id: ownerFor(req) }), 201);
}));

router.patch('/environments/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const current = await requireScoped('environments', idFrom(req.params.id), ownerFor(req));
  const body = { ...current, ...req.body };
  const payload = environmentPayload(body);
  payload.updated_at = new Date().toISOString();
  response(res, await update('environments', current.id, ownerFor(req), payload));
}));

router.delete('/environments/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await remove('environments', idFrom(req.params.id), ownerFor(req));
  response(res, { deleted: true });
}));

// Reports
router.get('/reports', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { data, error } = await scopedQuery('reports', ownerFor(req)).order('created_at', { ascending: false });
  if (error) throw error;
  response(res, data || []);
}));

router.post('/reports', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  const title = requiredText(req.body?.title || 'Local test report', 'Report title');
  const from = typeof req.body?.period_start === 'string' ? req.body.period_start : undefined;
  const to = typeof req.body?.period_end === 'string' ? req.body.period_end : undefined;
  let query = owner
    ? db.supabaseDb.from('test_runs').select('*').eq('user_id', owner)
    : db.supabaseDb.from('test_runs').select('*').or('user_id.is.null');
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lt('created_at', to);
  const { data: runs, error: runsError } = await query.order('created_at', { ascending: false }).limit(1000);
  if (runsError) throw runsError;

  const runRows = (runs || []) as Row[];
  const total = runRows.length;
  const passed = runRows.filter((run) => run.overall_status === 'PASSED').length;
  const failed = runRows.filter((run) => run.overall_status === 'FAILED' || run.status === 'FAILED').length;
  const warning = runRows.filter((run) => run.overall_status === 'WARNING').length;
  const report = await write('reports', {
    user_id: owner,
    title,
    period_start: from || null,
    period_end: to || null,
    total_tests: total,
    passed_tests: passed,
    failed_tests: failed,
    warning_tests: warning,
    pass_rate: total ? Number(((passed / total) * 100).toFixed(1)) : 0,
    data: {
      generated_at: new Date().toISOString(),
      run_ids: runRows.map((run) => run.id),
    },
  });
  response(res, report, 201);
}));

router.delete('/reports/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await remove('reports', idFrom(req.params.id), ownerFor(req));
  response(res, { deleted: true });
}));

// Artifacts are already downloaded through the ownership-checked test route.
router.get('/artifacts', asyncHandler(async (req: AuthRequest, res: Response) => {
  const owner = ownerFor(req);
  let runsQuery = owner
    ? db.supabaseDb.from('test_runs').select('id,created_at').eq('user_id', owner)
    : db.supabaseDb.from('test_runs').select('id,created_at').or('user_id.is.null');
  const { data: runs, error: runsError } = await runsQuery.order('created_at', { ascending: false }).limit(200);
  if (runsError) throw runsError;

  const artifacts: Row[] = [];
  for (const run of (runs || []) as Row[]) {
    const { data, error } = await db.supabaseDb
      .from('test_artifacts')
      .select('*')
      .eq('run_id', run.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    for (const artifact of (data || []) as Row[]) {
      const fileName = path.basename(String(artifact.file_path || `artifact-${artifact.id}`));
      artifacts.push({
        ...artifact,
        name: fileName,
        type: String(artifact.artifact_type || 'LOG').toLowerCase(),
        testRun: `Test Run #${run.id}`,
        downloadUrl: `/api/tests/${run.id}/artifacts/${artifact.id}/download`,
      });
    }
  }
  response(res, artifacts);
}));

export default router;
