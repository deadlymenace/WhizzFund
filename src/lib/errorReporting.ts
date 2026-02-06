import React from 'react';

interface ErrorData {
    message: string;
    stack?: string;
    componentStack?: string;
    url: string;
    type?: string;
}

const CIRCUIT_BREAKER_KEY = 'errorReporting_circuitBreaker';
const CIRCUIT_BREAKER_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

function isCircuitBroken(url: string): boolean {
    const storageKey = CIRCUIT_BREAKER_KEY + '_' + url;

    const circuitData = localStorage.getItem(storageKey);
    if (!circuitData) {
        return false;
    }

    const { timestamp } = JSON.parse(circuitData);
    const now = Date.now();
    const timeElapsed = now - timestamp;

    // If circuit breaker timeout has passed, reset it
    if (timeElapsed > CIRCUIT_BREAKER_TIMEOUT) {
        localStorage.removeItem(storageKey);
        return false;
    }

    return true;
}

function breakCircuit(url: string): void {
    const storageKey = CIRCUIT_BREAKER_KEY + '_' + url;
    const circuitData = {
        timestamp: Date.now()
    };

    console.warn(`Circuit breaker triggered for ${url}`);

    try {
        localStorage.setItem(storageKey, JSON.stringify(circuitData));
        console.warn(`Error reporting paused for ${CIRCUIT_BREAKER_TIMEOUT / 60000} minutes.`);
    } catch (error) {
        console.error('Failed to set circuit breaker in localStorage:', error);
    }
}

function generateHash(errorMessage: string): string {
    // Simple hash function for unique error identification
    const str = errorMessage;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32-bit integer
    }
    return hash.toString();
}

function sendErrorToAPI(
    error: Error,
    errorInfo?: React.ErrorInfo,
    errorReportUrl?: string,
    type: string = 'react'
): void {
    console.log(`Sending ${type} error to API`, error.message, errorReportUrl);
    console.log('Error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        type
    });

    if (!error.message || !errorReportUrl) {
        console.warn("Missing required error reporting data:", {
            hasMessage: !!error.message,
            hasUrl: !!errorReportUrl,
        });
        return;
    }

    // Check if circuit breaker is active for this URL
    if (isCircuitBroken(errorReportUrl)) {
        console.log('Circuit breaker active, skipping error report:', error.message);
        return;
    }

    const errorData: ErrorData = {
        message: error.message,
        stack: error.stack || '',
        componentStack: errorInfo?.componentStack || '',
        url: window.location.href,
        type: type
    };

    const errorHash = generateHash(error.message);

    // Check if this error was already reported
    const errorHashKey = errorHash;

    if (!localStorage.getItem(errorHashKey)) {
        fetch(errorReportUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorData),
        })
            .then((response) => {
                console.log(`API response status: ${response.status}`);

                // Check for 5xx errors or 429 (Too Many Requests) or 410 (Gone)
                if ((response.status >= 500 && response.status < 600) || response.status === 429 || response.status === 410) {
                    console.warn(`Received error status: ${response.status}, breaking circuit`);
                    breakCircuit(errorReportUrl);
                    return { error: `Server error: ${response.status}` };
                }
                return response.json();
            })
            .then((data) => {
                console.log('Error reported successfully:', data);
                localStorage.setItem(errorHashKey, 'reported');
            })
            .catch((err) => {
                console.error('Failed to report error:', err);
                // Could be a network error, also trigger circuit breaker
                console.warn('Network or parsing error, breaking circuit');
                breakCircuit(errorReportUrl);
            });
    } else {
        console.log('Duplicate error skipped:', errorData.message);
    }
}

// Setup global error handlers
function setupGlobalErrorHandlers(errorReportUrl?: string): void {
    if (!errorReportUrl) {
        console.warn("Global error handlers not set up due to missing parameters");
        return;
    }

    // Handle uncaught exceptions
    window.onerror = function (message, source, lineno, colno, error) {
        if (error) {
            sendErrorToAPI(error, undefined, errorReportUrl, 'global');
        } else {
            // If error object is not available, create one
            const syntheticError = new Error(message as string);
            syntheticError.stack = `at ${source}:${lineno}:${colno}`;
            sendErrorToAPI(syntheticError, undefined, errorReportUrl, 'global');
        }
        return false; // Let the default handler run
    };

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function (event) {
        let error: Error;
        if (event.reason instanceof Error) {
            error = event.reason;
        } else {
            error = new Error(String(event.reason));
            error.stack = 'Unhandled Promise rejection';
        }
        sendErrorToAPI(error, undefined, errorReportUrl, 'promise');
    });

    console.log("Global error handlers set up successfully");
}

export { sendErrorToAPI, setupGlobalErrorHandlers };
