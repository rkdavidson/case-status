function getFilenameTimestamp(includeTime = true) {
  const now = new Date();
  const dateString = now.toISOString().slice(0, 10);

  if (includeTime === true) {
    const timeString = now.toTimeString().slice(0, 8).replace(/\:/g, '');
    return `${dateString}-${timeString}`;
  }

  return dateString;
}

module.exports = {
  getFilenameTimestamp
}