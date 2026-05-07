const exts = {
	image: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"],
	video: [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"],
	audio: [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"],
	document: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".md"],
	archive: [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
};

const getExt = (filename = "") => {
	const idx = filename.lastIndexOf(".");
	return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
};

const isType = (filename, type) => {
	const ext = getExt(filename);
	return Array.isArray(exts[type]) ? exts[type].includes(ext) : false;
};

const fileType = (ext) => {
    ext = ext.toLowerCase();
    if (exts.image.includes(ext)) return 'image';
    if (exts.video.includes(ext)) return 'video';
    if (exts.audio.includes(ext)) return 'audio';
    if (exts.document.includes(ext)) return 'document';
    if (exts.archive.includes(ext)) return 'archive';
    return 'otherfile';
}

module.exports = { exts, getExt, isType, fileType };
