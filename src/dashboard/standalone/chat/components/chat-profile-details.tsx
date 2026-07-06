
import {
  Building2,
  Calendar,
  CheckCircle2,
  Globe,
  Link,
  Mail,
  MapPin,
  Monitor,
  MoreHorizontal,
  Phone,
  PhoneCall,
  Tag,
  UserRound,
  X,
} from "lucide-react-dash";

import { Avatar, AvatarFallback } from "@/components/dashboard-ui/avatar";
import { Badge } from "@/components/dashboard-ui/badge";
import { Button } from "@/components/dashboard-ui/button";
import { Separator } from "@/components/dashboard-ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { getInitials } from "@/lib/utils";

import type { Contact } from "./data";

interface ChatProfileDetailsProps {
  contact: Contact;
  onClose?: () => void;
}

export function ChatProfileDetails({ contact, onClose }: ChatProfileDetailsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4">
      <div className="flex items-start gap-3">
        <Avatar size="lg" className="shrink-0">
          <AvatarFallback className="bg-background">{getInitials(contact.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="truncate font-medium leading-5">{contact.name}</div>
          <div className="truncate text-muted-foreground text-xs">{contact.role}</div>
        </div>

        <Button variant="ghost" size="icon-sm" aria-label={t('dashChat.profile.closeAria')} onClick={onClose}>
          <X />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button size="icon-sm" variant="ghost" aria-label={t('dashChat.profile.emailAria')}>
          <Mail className="size-3.5" />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label={t('dashChat.profile.callAria')}>
          <PhoneCall className="size-3.5" />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label={t('dashChat.profile.scheduleAria')}>
          <Calendar className="size-3.5" />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label={t('dashChat.profile.copyLinkAria')}>
          <Link className="size-3.5" />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label={t('dashChat.profile.moreAria')}>
          <MoreHorizontal className="size-3.5" />
        </Button>
      </div>

      <Tabs defaultValue="details">
        <TabsList variant="line" className="w-full justify-between border-b px-0 **:data-[slot=tabs-trigger]:flex-1">
          <TabsTrigger value="details">{t('dashChat.profile.tabDetails')}</TabsTrigger>
          <TabsTrigger value="files">{t('dashChat.profile.tabFiles')}</TabsTrigger>
          <TabsTrigger value="activity">{t('dashChat.profile.tabActivity')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{t('dashChat.profile.fieldEmail')}</span>
            <span className="ml-auto truncate text-sm">{contact.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{t('dashChat.profile.fieldPhone')}</span>
            <span className="ml-auto truncate text-sm">{contact.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{t('dashChat.profile.fieldWebsite')}</span>
            <span className="ml-auto truncate text-sm">{contact.website}</span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{t('dashChat.profile.fieldCompany')}</span>
            <span className="ml-auto truncate text-sm">{contact.company}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserRound className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{t('dashChat.profile.fieldRole')}</span>
            <span className="ml-auto truncate text-sm">{contact.role}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{t('dashChat.profile.fieldStage')}</span>
            <Badge variant="secondary" className="ml-auto">
              {contact.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{t('dashChat.profile.fieldQualifiedSince')}</span>
            <span className="ml-auto truncate text-sm">{contact.qualifiedAt}</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{t('dashChat.profile.fieldTimezone')}</span>
            <span className="ml-auto truncate text-sm">{contact.timezone}</span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{t('dashChat.profile.fieldLocation')}</span>
            <span className="ml-auto truncate text-sm">{contact.location}</span>
          </div>
          <div className="flex items-start gap-2">
            <Tag className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{t('dashChat.profile.fieldTags')}</span>
            <div className="ml-auto flex flex-wrap justify-end gap-1">
              {contact.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
