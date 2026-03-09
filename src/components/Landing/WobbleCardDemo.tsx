"use client";

import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { WobbleCard } from "../ui/wobble-card";

export default function WobbleCardDemo() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto grid w-full max-w-[92rem] grid-cols-1 gap-4 lg:grid-cols-3 xl:max-w-[98rem] xl:gap-5 2xl:max-w-[104rem]">
      <WobbleCard
        containerClassName="col-span-1 min-h-[500px] border border-white/10 bg-[linear-gradient(135deg,#191919_0%,#241109_42%,#0b0b0b_100%)] lg:col-span-2 lg:min-h-[320px]"
        className="flex h-full flex-col items-center justify-start gap-6 pb-8 text-center lg:items-start lg:justify-between lg:gap-0 lg:pb-16 lg:pr-[18%] lg:text-left xl:pr-[20%]"
      >
        <div className="relative z-10 flex max-w-sm flex-col items-center sm:max-w-lg lg:items-start">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B] lg:text-left">
            {t("wobble.card1.eyebrow")}
          </p>
          <h2 className="mt-4 text-balance text-[2rem] leading-[1.02] font-semibold tracking-[-0.035em] text-white sm:text-[2.35rem] md:text-4xl lg:text-left lg:text-5xl xl:text-[3.6rem] xl:leading-[1.02]">
            {t("wobble.card1.title")}
          </h2>
          <p className="mt-5 text-base/7 text-neutral-200 sm:text-lg/8 md:text-xl/9 lg:text-left">
            {t("wobble.card1.description")}
          </p>
        </div>
        <div className="relative z-10 w-full px-2 lg:hidden">
          <div className="mx-auto aspect-[2932/1470] w-full max-w-[21rem] overflow-hidden rounded-2xl border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.38)] sm:max-w-[24rem]">
            <img
              src="/desktop1.png"
              width={2932}
              height={1470}
              alt="ClerkTree desktop workflow preview"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-3 right-2 z-0 hidden w-[82%] max-w-[22rem] overflow-hidden rounded-2xl border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.38)] sm:-right-4 sm:-bottom-10 sm:w-[72%] sm:max-w-[25rem] lg:block lg:bottom-0 lg:left-[54%] lg:right-auto lg:top-0 lg:h-full lg:w-[60%] lg:max-w-none lg:rounded-none lg:border-y-0 lg:border-r-0 xl:left-[52%] xl:w-[62%]">
          <img
            src="/desktop1.png"
            width={2932}
            height={1470}
            alt="ClerkTree desktop workflow preview"
            className="h-full w-full object-cover object-left"
          />
        </div>
      </WobbleCard>

      <WobbleCard
        containerClassName="col-span-1 min-h-[560px] border border-white/10 bg-[linear-gradient(180deg,#151515_0%,#0e0e0e_100%)] sm:min-h-[620px] lg:min-h-[300px]"
        className="relative flex h-full flex-col items-center justify-start gap-6 pb-8 text-center lg:items-start lg:justify-between lg:gap-0 lg:pb-10 lg:pr-[33%] lg:text-left"
      >
        <div className="relative z-10 flex flex-col items-center lg:items-start">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55 lg:text-left">
            {t("wobble.card2.eyebrow")}
          </p>
          <h2 className="mt-4 max-w-xs text-balance text-[1.8rem] leading-[1.05] font-semibold tracking-[-0.03em] text-white sm:max-w-sm sm:text-[2.1rem] md:text-3xl lg:max-w-sm lg:text-left lg:text-4xl">
            {t("wobble.card2.title")}
          </h2>
        </div>
        <p className="relative z-10 max-w-[18rem] text-base/7 text-neutral-300 sm:max-w-[24rem] sm:text-lg/8 md:text-xl/9 lg:max-w-[28rem] lg:text-left">
          {t("wobble.card2.description")}
        </p>
        <div className="relative z-10 w-full px-2 lg:hidden">
          <div className="mx-auto aspect-[724/1280] w-[46%] max-w-[12rem] overflow-hidden rounded-[1.8rem] border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.45)] sm:max-w-[13.5rem]">
            <img
              src="/mobile.jpeg"
              width={724}
              height={1280}
              alt="ClerkTree mobile voice agent preview"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
        <img
          src="/mobile.jpeg"
          width={724}
          height={1280}
          alt="ClerkTree mobile voice agent preview"
          className="pointer-events-none absolute right-4 top-4 z-0 hidden w-[43%] max-w-[9.5rem] rounded-[1.4rem] border border-white/10 object-contain shadow-[0_18px_45px_rgba(0,0,0,0.45)] lg:block lg:w-[33%] lg:max-w-[12rem]"
        />
      </WobbleCard>

      <WobbleCard
        containerClassName="col-span-1 min-h-[500px] border border-[#FF4D00]/20 bg-[linear-gradient(135deg,#111111_0%,#1B140F_38%,#0F1720_100%)] lg:col-span-3 lg:min-h-[600px] xl:min-h-[320px]"
        className="flex h-full flex-col items-center justify-start gap-6 pb-8 text-center lg:items-start lg:justify-between lg:gap-0 lg:pb-20 lg:pr-[16%] lg:text-left xl:pr-[18%]"
      >
        <div className="relative z-10 flex max-w-lg flex-col items-center sm:max-w-2xl lg:items-start">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B] lg:text-left">
            {t("wobble.card3.eyebrow")}
          </p>
          <h2 className="mt-4 max-w-2xl text-balance text-[2rem] leading-[1.02] font-semibold tracking-[-0.035em] text-white sm:text-[2.4rem] md:text-4xl lg:text-left lg:text-5xl xl:text-[3.7rem] xl:leading-[1.02]">
            {t("wobble.card3.title")}
          </h2>
          <p className="mt-5 max-w-[42rem] text-base/7 text-neutral-200 sm:text-lg/8 md:text-xl/9 lg:text-left">
            {t("wobble.card3.description")}
          </p>
        </div>
        <div className="relative z-10 w-full px-2 lg:hidden">
          <div className="mx-auto aspect-[2560/1386] w-full max-w-[22rem] overflow-hidden rounded-2xl border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.38)] sm:max-w-[26rem]">
            <img
              src="/desktop3.png"
              width={2560}
              height={1386}
              alt="ClerkTree desktop operations preview"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-3 right-2 z-0 hidden w-[82%] max-w-[23rem] overflow-hidden rounded-2xl border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.38)] sm:-right-6 sm:-bottom-6 sm:w-[72%] sm:max-w-[26rem] lg:block lg:bottom-0 lg:left-[56%] lg:right-auto lg:top-0 lg:h-full lg:w-[48%] lg:max-w-none lg:rounded-none lg:border-y-0 lg:border-r-0 xl:left-[55%] xl:w-[50%]">
          <img
            src="/desktop3.png"
            width={2560}
            height={1386}
            alt="ClerkTree desktop operations preview"
            className="h-full w-full object-cover object-left"
          />
        </div>
      </WobbleCard>
    </div>
  );
}
