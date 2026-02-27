import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";

const STORAGE_KEY = "clerktree-banner-dismissed";

interface AnnouncementBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
}

export default function AnnouncementBanner({
  onVisibilityChange,
}: AnnouncementBannerProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  });

  useEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleArrowClick = () => {
    navigate("/docs");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 left-0 right-0 z-[60] overflow-hidden"
        >
          <div
            className="relative w-full flex items-center justify-center px-12 sm:px-16 py-3"
            style={{
              background: "rgb(18, 18, 18)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            {/* Centered text + arrow */}
            <button
              onClick={handleArrowClick}
              className="flex items-center gap-2 group bg-transparent border-none outline-none cursor-pointer max-w-[calc(100%-3rem)]"
            >
              <span
                className="text-xs sm:text-sm font-medium text-center leading-snug"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                <span style={{ color: "#c8a250" }}>ClerkTree API</span>
                <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  {" "}
                  {t("announcement.apiAvailable")}
                </span>
              </span>
              <span
                className="text-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0"
                style={{ color: "rgba(255, 255, 255, 0.5)" }}
              >
                ↗
              </span>
            </button>

            {/* Close button - positioned away from arrow */}
            <button
              onClick={handleDismiss}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-sm transition-colors hover:bg-white/10"
              aria-label="Dismiss announcement"
            >
              <X
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                style={{ color: "rgba(255, 255, 255, 0.4)" }}
              />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
