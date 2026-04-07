import type { AuditProgress, ModuleResult, OverallSummary } from './auditApi';

// ─── WebSocket message types ───────────────────────────────────────────────

/**
 * Every frame the server sends is one of these discriminated union members.
 * The `type` field is used as the discriminant.
 */
export type WsMessage =
    | WsProgress
    | WsModuleComplete
    | WsPeerReview
    | WsArbitration
    | WsAuditComplete
    | WsError;

/** Emitted while a module is running — stage progress update. */
export interface WsProgress {
    type: 'progress';
    audit_id: string;
    stage: AuditProgress['stage'];
    module?: string;         // e.g. "M1_GOVERNANCE"
    message: string;
    timestamp: string;
}

/** Emitted when a single module finishes. Contains the full ModuleResult. */
export interface WsModuleComplete {
    type: 'module_complete';
    audit_id: string;
    module_id: string;       // "M1_GOVERNANCE" | "M2_FAIRNESS" | …
    module_name: string;
    result: ModuleResult;
    timestamp: string;
}

/** Emitted for each peer-review card from the Council of Experts stage. */
export interface WsPeerReview {
    type: 'peer_review';
    audit_id: string;
    reviewer: string;
    reviewed: string;
    comment: string;
    flag: boolean;
    timestamp: string;
}

/** Emitted when the arbitrator synthesis is complete. */
export interface WsArbitration {
    type: 'arbitration';
    audit_id: string;
    summary: OverallSummary;
    timestamp: string;
}

/** Final frame — audit is done, fetch full results via REST. */
export interface WsAuditComplete {
    type: 'audit_complete';
    audit_id: string;
    final_score: number;
    decision: 'PASS' | 'FAIL' | 'ESCALATE';
    timestamp: string;
}

/** Server-side error during execution. */
export interface WsError {
    type: 'error';
    audit_id: string;
    message: string;
    timestamp: string;
}

// ─── Event handler map ─────────────────────────────────────────────────────

export interface AuditWebSocketHandlers {
    onProgress?: (msg: WsProgress) => void;
    onModuleComplete?: (msg: WsModuleComplete) => void;
    onPeerReview?: (msg: WsPeerReview) => void;
    onArbitration?: (msg: WsArbitration) => void;
    onAuditComplete?: (msg: WsAuditComplete) => void;
    onError?: (msg: WsError | Event) => void;
    onOpen?: () => void;
    onClose?: () => void;
}

// ─── AuditWebSocket class ─────────────────────────────────────────────────

const WS_BASE_URL = 'ws://localhost:8000/ws';

export class AuditWebSocket {
    private ws: WebSocket | null = null;
    private auditId: string | null = null;
    private handlers: AuditWebSocketHandlers = {};

    // Reconnect state
    private reconnectAttempts = 0;
    private readonly maxReconnects: number;
    private readonly reconnectDelayMs: number;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private _pingInterval: ReturnType<typeof setInterval> | null = null;
    private manualClose = false;

    constructor({
        maxReconnects = 3,
        reconnectDelayMs = 2000,
    }: { maxReconnects?: number; reconnectDelayMs?: number } = {}) {
        this.maxReconnects = maxReconnects;
        this.reconnectDelayMs = reconnectDelayMs;
    }

    // ── Public API ───────────────────────────────────────────────────────────

    connect(auditId: string, handlers: AuditWebSocketHandlers): void {
        this.auditId = auditId;
        this.handlers = handlers;
        this.manualClose = false;
        this.reconnectAttempts = 0;
        this._open();
    }

    disconnect(): void {
        this.manualClose = true;
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        if (this._pingInterval) { clearInterval(this._pingInterval); this._pingInterval = null; }
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
    }

    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    private _open(): void {
        if (!this.auditId) return;
        this.ws = new WebSocket(`${WS_BASE_URL}/audits/${this.auditId}`);

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.handlers.onOpen?.();
            // Send ping every 10s to keep connection alive
            this._pingInterval = setInterval(() => {
                if (this.ws?.readyState === WebSocket.OPEN) {
                    this.ws.send('ping');
                }
            }, 10000);
        };

        this.ws.onmessage = (event: MessageEvent) => {
            let msg: WsMessage;
            try {
                msg = JSON.parse(event.data as string) as WsMessage;
            } catch {
                console.error('[AuditWebSocket] Failed to parse message:', event.data);
                return;
            }
            this._dispatch(msg);
        };

        this.ws.onerror = (event: Event) => {
            console.error('[AuditWebSocket] Error:', event);
            this.handlers.onError?.(event);
        };

        this.ws.onclose = (event: CloseEvent) => {
            this.handlers.onClose?.();
            if (!this.manualClose && event.code !== 1000) {
                this._scheduleReconnect();
            }
        };
    }

    private _dispatch(msg: WsMessage): void {
        if ((msg as any).type === 'ping') return; // server keepalive — ignore
        switch (msg.type) {
            case 'progress': this.handlers.onProgress?.(msg); break;
            case 'module_complete': this.handlers.onModuleComplete?.(msg); break;
            case 'peer_review': this.handlers.onPeerReview?.(msg); break;
            case 'arbitration': this.handlers.onArbitration?.(msg); break;
            case 'audit_complete': this.handlers.onAuditComplete?.(msg); break;
            case 'error': this.handlers.onError?.(msg); break;
            default:
                console.warn('[AuditWebSocket] Unknown message type:', (msg as WsMessage).type);
        }
    }

    private _scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnects) {
            console.warn('[AuditWebSocket] Max reconnect attempts reached.');
            return;
        }
        const delay = this.reconnectDelayMs * 2 ** this.reconnectAttempts;
        this.reconnectAttempts++;
        console.info(`[AuditWebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnects})…`);
        this.reconnectTimer = setTimeout(() => this._open(), delay);
    }
}

// ─── React hook ───────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import type { ModuleResult as ApiModuleResult } from './auditApi';

export interface UseAuditWebSocketState {
    connected: boolean;
    progress: WsProgress | null;
    moduleResults: Record<string, ApiModuleResult>;  // keyed by module_id
    arbitrationSummary: OverallSummary | null;
    finalDecision: WsAuditComplete | null;
    error: string | null;
}

/**
 * React hook that opens an AuditWebSocket for the given auditId,
 * collects streaming results, and exposes them as state.
 *
 * Usage:
 *   const { connected, progress, moduleResults, finalDecision } = useAuditWebSocket(auditId);
 */
export function useAuditWebSocket(auditId: string | null): UseAuditWebSocketState {
    const socketRef = useRef<AuditWebSocket | null>(null);

    const [state, setState] = useState<UseAuditWebSocketState>({
        connected: false,
        progress: null,
        moduleResults: {},
        arbitrationSummary: null,
        finalDecision: null,
        error: null,
    });

    useEffect(() => {
        if (!auditId) return;

        const socket = new AuditWebSocket({ maxReconnects: 3, reconnectDelayMs: 2000 });
        socketRef.current = socket;

        socket.connect(auditId, {
            onOpen: () =>
                setState(s => ({ ...s, connected: true, error: null })),

            onClose: () =>
                setState(s => ({ ...s, connected: false })),

            onProgress: (msg) =>
                setState(s => ({ ...s, progress: msg })),

            onModuleComplete: (msg) =>
                setState(s => ({
                    ...s,
                    moduleResults: { ...s.moduleResults, [msg.module_id]: msg.result },
                    // Update progress label
                    progress: {
                        type: 'progress',
                        audit_id: msg.audit_id,
                        stage: 'module_complete',
                        module: msg.module_id,
                        message: `${msg.module_name} complete — score: ${msg.result.module_score.toFixed(3)}`,
                        timestamp: msg.timestamp,
                    },
                })),

            onArbitration: (msg) =>
                setState(s => ({ ...s, arbitrationSummary: msg.summary })),

            onAuditComplete: (msg) =>
                setState(s => ({ ...s, finalDecision: msg, connected: false })),

            onError: (msgOrEvent) => {
                const text =
                    typeof msgOrEvent === 'object' && 'message' in msgOrEvent
                        ? (msgOrEvent as WsError).message
                        : 'WebSocket connection error';
                setState(s => ({ ...s, error: text }));
            },
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [auditId]);

    return state;
}

// ─── Usage examples ───────────────────────────────────────────────────────
//
// 1. Bare class (outside React):
//
//    const ws = new AuditWebSocket();
//    ws.connect('audit-ttmt-2026-001', {
//      onProgress:       (msg) => console.log(msg.message),
//      onModuleComplete: (msg) => updateModuleScore(msg.module_id, msg.result.module_score),
//      onArbitration:    (msg) => showDecision(msg.summary),
//      onAuditComplete:  (msg) => fetchAndRenderResults(msg.audit_id),
//      onError:          (err) => showErrorBanner(err),
//    });
//    // Later:
//    ws.disconnect();
//
// 2. React hook:
//
//    const { connected, progress, moduleResults, finalDecision, error } =
//      useAuditWebSocket(currentAuditId);
//
//    // Stream module scores into RightPanel as they arrive:
//    Object.entries(moduleResults).map(([id, result]) => (
//      <ModuleScoreCard key={id} moduleId={id} score={result.module_score} />
//    ));