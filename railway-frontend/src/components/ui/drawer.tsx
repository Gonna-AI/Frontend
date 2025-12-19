import React, { useState, useEffect, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface DrawerContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

const useDrawer = () => {
    const context = useContext(DrawerContext);
    if (!context) {
        throw new Error("Drawer components must be used within a Drawer");
    }
    return context;
};

interface DrawerProps {
    children: React.ReactNode;
}

export function Drawer({ children }: DrawerProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <DrawerContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </DrawerContext.Provider>
    );
}

interface DrawerTriggerProps {
    children: React.ReactNode;
    className?: string;
}

export function DrawerTrigger({ children, className }: DrawerTriggerProps) {
    const { setIsOpen } = useDrawer();

    return (
        <button
            onClick={() => setIsOpen(true)}
            className={cn(className)}
        >
            {children}
        </button>
    );
}

interface DrawerContentProps {
    children: React.ReactNode;
    className?: string;
}

export function DrawerContent({ children, className }: DrawerContentProps) {
    const { isOpen, setIsOpen } = useDrawer();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    const drawerContent = (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed inset-0 bg-black/50 z-[100]"
                        onClick={() => setIsOpen(false)}
                    />

                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{
                            duration: 0.25,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        className={cn(
                            "fixed bottom-3 left-3 right-3 backdrop-blur-2xl border border-white/30 rounded-3xl z-[100] flex flex-col",
                            className
                        )}
                        style={{
                            maxHeight: '85vh',
                            top: 'auto',
                            background: 'rgba(10, 10, 10, 0.3)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return createPortal(drawerContent, document.body);
}

interface DrawerHeaderProps {
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

export function DrawerHeader({ children, className, showCloseButton = true }: DrawerHeaderProps) {
    const { setIsOpen } = useDrawer();

    return (
        <div className={cn("flex items-center justify-between p-4 border-b border-transparent flex-shrink-0", className)}>
            <div className="flex-1">{children}</div>
            {showCloseButton && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                    className="text-white/60 hover:text-white transition-colors ml-4 flex-shrink-0"
                >
                    <X size={20} />
                </motion.button>
            )}
        </div>
    );
}

interface DrawerBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function DrawerBody({ children, className }: DrawerBodyProps) {
    return (
        <div className={cn("p-4 overflow-y-auto flex-1 min-h-0", className)}>
            {children}
        </div>
    );
}

interface DrawerFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function DrawerFooter({ children, className }: DrawerFooterProps) {
    return (
        <div className={cn("border-t border-border", className)}>
            {children}
        </div>
    );
}

