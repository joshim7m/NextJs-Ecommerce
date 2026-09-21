import path from 'path';

const root = () => process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

export const catalogRoot = () => path.join(root(), 'catalog');
export const exportDir = () => path.join(catalogRoot(), 'exports');
export const importOriginalDir = () => path.join(catalogRoot(), 'imports', 'original');
export const catalogTmpDir = (jobId) => path.join(catalogRoot(), 'tmp', jobId);
