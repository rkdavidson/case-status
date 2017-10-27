const path = require('path');
const fse = require('fs-extra');
const uuid = require('uuid');

const dateUtils = require('./dateUtils');
const { paths } = require('./config');

// :: Helpers
// ----------------------------------------

const getCachePath = (...pathParts) => path.join(paths.cache, ...pathParts);
const curryGetCachedStatusPath = (caseId) => (...pathParts) => getCachePath(caseId, ...pathParts);

// :: Public
// ----------------------------------------

async function cacheCaseStatus(caseId, content, setAsLatest = true) {
  const getCachedStatusPath = curryGetCachedStatusPath(caseId);
  const statusFilePath = getCachedStatusPath( generateCachedStatusFileName() );
  const latestSymlink = getCachedStatusPath('_latest.json');

  try {
    // Ensure directory and write the JSON file
    await fse.ensureDir( getCachedStatusPath() );
    await fse.writeJson(statusFilePath, {
      date: Date.now(),
      content
    });

    // Optionally update symlink
    if (setAsLatest) {
      await updateSymlink(latestSymlink, statusFilePath);
    }
  } catch (err) {
    console.error('❌  Error: ', err);
  }
}

// :: Private
// ----------------------------------------

function generateCachedStatusFileName(timestamp) {
  const hash = uuid().slice(-7);

  return `status_${timestamp}_${hash}.json`;
}

/**
 * Updates a symlink by creating a new temporary one, then overwriting
 * the existing symlink
 * @param {*} srcPath The path of the symlink (source)
 * @param {*} targetPath The path of the symlink target
 */
async function updateSymlink(srcPath, targetPath) {
  const tmpSymlinkPath = `$ targetPath}.tmp`;

  await fse.ensureSymlink(srcPath, tmpSymlinkPath);
  await fse.move(tmpSymlinkPath, targetPath, { overwrite: true });
}

// :: EXPORTS
// ----------------------------------------

module.exports = {
  cacheCaseStatus
};