import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2 text-white">Something went wrong</h1>
                <p className="text-zinc-400 mb-6">
                    We apologize for the inconvenience. The application encountered an unexpected error.
                </p>

                <div className="bg-black/50 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32 border border-zinc-800">
                    <p className="font-mono text-sm text-red-400 break-all">
                        {error.message}
                    </p>
                </div>

                <button
                    onClick={resetErrorBoundary}
                    className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                </button>
            </div>
        </div>
    );
};

export default ErrorFallback;
