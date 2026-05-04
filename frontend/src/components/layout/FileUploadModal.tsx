import { X, Upload, FileText, CheckCircle, Link, Github, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

type Tab = 'files' | 'url' | 'github';

interface FileUploadModalProps {
    onClose: () => void;
    onUpload: (files: File[], urls?: string[], githubRepos?: string[]) => void;
}

const FileUploadModal = ({ onClose, onUpload }: FileUploadModalProps) => {
    const [activeTab, setActiveTab] = useState<Tab>('files');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [urls, setUrls] = useState<string[]>([]);
    const [urlError, setUrlError] = useState('');
    const [githubInput, setGithubInput] = useState('');
    const [githubRepos, setGithubRepos] = useState<string[]>([]);
    const [githubError, setGithubError] = useState('');

    // ── File handlers ─────────────────────────────────────────────────────────
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    };
    const removeFile = (i: number) => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i));

    // ── URL handlers ──────────────────────────────────────────────────────────
    const addUrl = () => {
        setUrlError('');
        const trimmed = urlInput.trim();
        if (!trimmed) return;
        try {
            new URL(trimmed);
        } catch {
            setUrlError('Please enter a valid URL (e.g. https://example.com/policy.pdf)');
            return;
        }
        if (urls.includes(trimmed)) { setUrlError('This URL has already been added.'); return; }
        setUrls(prev => [...prev, trimmed]);
        setUrlInput('');
    };
    const removeUrl = (i: number) => setUrls(prev => prev.filter((_, idx) => idx !== i));

    // ── GitHub handlers ───────────────────────────────────────────────────────
    const normalizeGithub = (input: string): string => {
        const trimmed = input.trim();
        // Accept: owner/repo, https://github.com/owner/repo, github.com/owner/repo
        const match = trimmed.match(/(?:https?:\/\/)?github\.com\/([^/\s]+\/[^/\s]+)/);
        if (match) return match[1];
        if (/^[^/\s]+\/[^/\s]+$/.test(trimmed)) return trimmed;
        return '';
    };

    const addGithub = () => {
        setGithubError('');
        const normalized = normalizeGithub(githubInput);
        if (!normalized) {
            setGithubError('Enter a GitHub repo as owner/repo or https://github.com/owner/repo');
            return;
        }
        if (githubRepos.includes(normalized)) { setGithubError('This repo has already been added.'); return; }
        setGithubRepos(prev => [...prev, normalized]);
        setGithubInput('');
    };
    const removeGithub = (i: number) => setGithubRepos(prev => prev.filter((_, idx) => idx !== i));

    // ── Submit ────────────────────────────────────────────────────────────────
    const totalSources = selectedFiles.length + urls.length + githubRepos.length;
    const canSubmit = totalSources > 0;

    const handleUpload = () => {
        if (!canSubmit) return;
        onUpload(selectedFiles, urls, githubRepos);
        onClose();
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    };

    const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
        { id: 'files', label: 'Files', icon: <Upload className="w-3.5 h-3.5" /> },
        { id: 'url', label: 'URL', icon: <Link className="w-3.5 h-3.5" /> },
        { id: 'github', label: 'GitHub Repo', icon: <Github className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[88vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Start New Audit</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Upload files, paste a URL, or connect a GitHub repository</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-5 pt-3 gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all -mb-px ${activeTab === tab.id
                                ? 'border-teal-600 text-teal-700 bg-teal-50'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">

                    {/* ── Files tab ── */}
                    {activeTab === 'files' && (
                        <>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-700 mb-1">Drag and drop files here</p>
                                <p className="text-xs text-gray-400 mb-4">PDF, DOCX, TXT, CSV, JSON, XLSX</p>
                                <label className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors">
                                    <Upload className="w-3.5 h-3.5" />
                                    Browse Files
                                    <input type="file" multiple onChange={handleFileSelect} className="hidden"
                                        accept=".pdf,.doc,.docx,.txt,.csv,.json,.xml,.xlsx,.xls" />
                                </label>
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="mt-4 space-y-1.5">
                                    <p className="text-xs font-medium text-gray-500">{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected</p>
                                    {selectedFiles.map((file, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                                            <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                                            </div>
                                            <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── URL tab ── */}
                    {activeTab === 'url' && (
                        <>
                            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                                Paste a direct link to a publicly accessible document. The backend will fetch and extract the text for auditing.
                            </p>
                            <div className="flex gap-2 mb-1">
                                <input
                                    type="text"
                                    value={urlInput}
                                    onChange={(e) => { setUrlInput(e.target.value); setUrlError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                                    placeholder="https://example.com/ai-governance-policy.pdf"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                />
                                <button
                                    onClick={addUrl}
                                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg font-medium transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            {urlError && (
                                <div className="flex items-center gap-1.5 text-xs text-red-600 mb-3">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{urlError}
                                </div>
                            )}

                            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700 leading-relaxed mb-3">
                                <strong>Supported:</strong> Direct PDF/DOCX/TXT links, public Google Docs export links, Notion pages, Confluence pages, GitHub raw file URLs.
                            </div>

                            {urls.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-gray-500">{urls.length} URL{urls.length > 1 ? 's' : ''} added</p>
                                    {urls.map((url, i) => (
                                        <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                                            <Link className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                            <p className="text-xs text-gray-700 truncate flex-1">{url}</p>
                                            <button onClick={() => removeUrl(i)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── GitHub tab ── */}
                    {activeTab === 'github' && (
                        <>
                            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                                Enter a public GitHub repository. TrustGuard will fetch README, policy docs, and markdown files from the repo for auditing.
                            </p>
                            <div className="flex gap-2 mb-1">
                                <div className="flex-1 relative">
                                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={githubInput}
                                        onChange={(e) => { setGithubInput(e.target.value); setGithubError(''); }}
                                        onKeyDown={(e) => e.key === 'Enter' && addGithub()}
                                        placeholder="owner/repo or https://github.com/owner/repo"
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                    />
                                </div>
                                <button
                                    onClick={addGithub}
                                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg font-medium transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            {githubError && (
                                <div className="flex items-center gap-1.5 text-xs text-red-600 mb-3">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{githubError}
                                </div>
                            )}

                            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700 leading-relaxed mb-3">
                                <strong>What gets fetched:</strong> README.md, GOVERNANCE.md, SECURITY.md, CONTRIBUTING.md, docs/ folder markdown files, and any .txt/.pdf files in the root. Private repos are not supported.
                            </div>

                            {githubRepos.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-gray-500">{githubRepos.length} repo{githubRepos.length > 1 ? 's' : ''} added</p>
                                    {githubRepos.map((repo, i) => (
                                        <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                                            <Github className="w-4 h-4 text-gray-700 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900">{repo}</p>
                                                <p className="text-xs text-gray-400">github.com/{repo}</p>
                                            </div>
                                            <button onClick={() => removeGithub(i)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Summary bar — all sources */}
                {totalSources > 0 && (
                    <div className="px-5 py-2 bg-teal-50 border-t border-teal-100 flex items-center gap-3 flex-wrap">
                        {selectedFiles.length > 0 && (
                            <span className="text-xs text-teal-700 flex items-center gap-1">
                                <Upload className="w-3 h-3" />{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                            </span>
                        )}
                        {urls.length > 0 && (
                            <span className="text-xs text-teal-700 flex items-center gap-1">
                                <Link className="w-3 h-3" />{urls.length} URL{urls.length > 1 ? 's' : ''}
                            </span>
                        )}
                        {githubRepos.length > 0 && (
                            <span className="text-xs text-teal-700 flex items-center gap-1">
                                <Github className="w-3 h-3" />{githubRepos.length} repo{githubRepos.length > 1 ? 's' : ''}
                            </span>
                        )}
                        <span className="text-xs text-teal-600 ml-auto">Ready to audit</span>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <p className="text-xs text-gray-400">
                        {totalSources === 0 ? 'No sources added yet' : `${totalSources} source${totalSources > 1 ? 's' : ''} ready`}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!canSubmit}
                            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-1.5"
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Start Audit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileUploadModal;