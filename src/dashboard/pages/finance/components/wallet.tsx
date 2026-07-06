import { Building2, Factory, Settings2 } from "lucide-react-dash";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard-ui/card";
import { Separator } from "@/components/dashboard-ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

export function Wallet() {
  const { t } = useLanguage();

  const walletCards = [
    {
      id: 1,
      bank: "THD GmbH",
      last4: "CNC",
      balance: `€40,000 ${t('dashFinance.wallet.quoted')}`,
      icon: Factory,
      iconColor: "fill-foreground",
    },
    {
      id: 2,
      bank: "Weber Präzisionstechnik GmbH",
      last4: "PRZ",
      balance: `€18,900 ${t('dashFinance.wallet.quoted')}`,
      icon: Settings2,
      iconColor: "fill-foreground",
    },

    {
      id: 4,
      bank: "MK Anlagenbau GmbH",
      last4: "ANL",
      balance: `€26,400 ${t('dashFinance.wallet.quoted')}`,
      icon: Building2,
      iconColor: "fill-foreground",
    },
  ];

  const cryptoAssets = [
    {
      id: 1,
      name: "Bergmann Maschinenbau GmbH",
      vault: "A-2026-0142 vs B-88431",
      balance: "€40,000 → €38,250",
      usdValue: `-€1,750 ${t('dashFinance.wallet.net')}`,
    },
    {
      id: 2,
      name: `Weber ${t('dashFinance.wallet.customerOrders')}`,
      vault: `3 ${t('dashFinance.wallet.comparisons')}`,
      balance: `€18,900 ${t('dashFinance.wallet.quoted')}`,
      usdValue: `€0 ${t('dashFinance.wallet.flaggedThisMonth')}`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">{t('dashFinance.wallet.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {walletCards.map((card) => (
            <div key={card.id} className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm leading-none">
                    {card.bank} • {card.last4}
                  </span>
                </div>
                <span className="font-normal text-muted-foreground text-xs">{card.balance}</span>
              </div>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
                <card.icon className="size-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col gap-4">
          {cryptoAssets.map((asset) => (
            <div key={asset.id} className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm leading-none">
                    {asset.name} • {asset.vault}
                  </span>
                </div>
                <span className="font-normal text-muted-foreground text-xs">
                  {asset.balance} • {asset.usdValue}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-[10px] text-muted-foreground">
              {t('dashFinance.wallet.dataSource')} <span className="text-foreground">Supabase (project xlzwfkgurrrspcdyqele)</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="font-bold text-[9px] text-green-500 uppercase tracking-widest">{t('dashFinance.wallet.live')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
