import { Link } from "react-router-dom";

import { ExternalLink } from "lucide-react-dash";

import { Button } from "@/components/dashboard-ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Page() {
  const { t } = useLanguage();

  return (
    <div className="relative z-0 flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-medium text-sm leading-none">{t('dashChat.chatPreview')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('dashChat.chatPreviewDesc')}
          </p>
        </div>
        <Button asChild variant="ghost" size="icon-sm">
          <Link to="/chat" target="_blank" rel="noreferrer" aria-label={t('dashChat.openInNewTab')}>
            <ExternalLink />
          </Link>
        </Button>
      </div>

      <iframe
        src="/chat?preview=dashboard"
        title={t('dashChat.chatPreview')}
        className="relative z-0 block min-h-0 flex-1 rounded-lg border bg-background [color-scheme:light]"
      />
    </div>
  );
}
