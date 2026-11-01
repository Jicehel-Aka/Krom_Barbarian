import React, { useState } from 'react';
import { BookOpen, Film, Footprints, Swords } from 'lucide-react';
import { CAMPAIGN_ACTS, MINION_ARCHETYPES, type CampaignAct } from '../data/campaign';
import {
  getLocalizedAct,
  getLocalizedForge,
  getLocalizedMinion,
  getLocalizedWebUi,
} from '../i18n/gameContentLocale';
import type { CutsceneId, LanguageCode, ProgressionState } from '../types/game';

interface CampaignChronicleProps {
  progression: ProgressionState;
  language: LanguageCode;
  onSelectActToPlay: (actIndex: number, entryMode: 'full' | 'boss_direct') => void;
  onPlayCutscene: (cutsceneId: CutsceneId, actIndex: number) => void;
}

const ActVisualHeader: React.FC<{ act: CampaignAct; actIndex: number; language: LanguageCode }> = ({
  act,
  actIndex,
  language,
}) => {
  const [zoneFailed, setZoneFailed] = useState(false);
  const [bossFailed, setBossFailed] = useState(false);
  const locAct = getLocalizedAct(actIndex, language);
  const ui = getLocalizedWebUi(language);
  const hpUnit = language === 'en' || language === 'de' ? 'HP' : 'PV';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-800/90 bg-slate-950">
      {/* Left: Side-scrolling Beat-'em-up Transition Zone */}
      <div className="relative h-40 overflow-hidden border-b sm:border-b-0 sm:border-r border-slate-800/80">
        {zoneFailed ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-stone-900 flex flex-col items-center justify-center p-4 text-center">
            <Footprints className="w-6 h-6 text-amber-400 mb-1.5" />
            <span className="text-xs font-semibold text-slate-200">{locAct.zoneTitle}</span>
          </div>
        ) : (
          <>
            <img
              src={act.zoneImage}
              alt={`${locAct.title} — ${locAct.zoneTitle}`}
              referrerPolicy="no-referrer"
              onError={() => setZoneFailed(true)}
              className="w-full h-full object-cover [image-rendering:pixelated]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151921] via-black/35 to-transparent" />
            <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-semibold text-amber-300 truncate">
                {ui.chronicleZoneLabel} · {locAct.zoneTitle}
              </span>
              <span className="text-[11px] font-mono text-slate-200 tabular-nums shrink-0">
                {ui.chronicleMinionsCount(act.zoneWaves.length)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right: Boss Arena */}
      <div className="relative h-40 overflow-hidden">
        {bossFailed ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-stone-900 to-amber-950/50 flex flex-col items-center justify-center p-4 text-center">
            <Swords className="w-6 h-6 text-amber-500 mb-1.5" />
            <span className="text-xs font-semibold text-slate-200">{locAct.regionName}</span>
          </div>
        ) : (
          <>
            <img
              src={act.image}
              alt={`${locAct.title} — ${locAct.bossName}`}
              referrerPolicy="no-referrer"
              onError={() => setBossFailed(true)}
              className="w-full h-full object-cover [image-rendering:pixelated]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151921] via-black/35 to-transparent" />
            <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-100 truncate">
                {ui.chronicleArenaLabel} · {locAct.regionName}
              </span>
              <span className="text-[11px] font-mono text-amber-300 tabular-nums shrink-0">
                {act.bossHp} {hpUnit}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const CampaignChronicle: React.FC<CampaignChronicleProps> = ({
  progression,
  language,
  onSelectActToPlay,
  onPlayCutscene,
}) => {
  const ui = getLocalizedWebUi(language);
  const fg = getLocalizedForge(language);
  const hpUnit = language === 'en' || language === 'de' ? 'HP' : 'PV';

  const actOpeningCutscenes: readonly CutsceneId[] = [
    'act1_opening',
    'act2_opening',
    'act3_opening',
    'act4_opening',
    'act5_opening',
    'act6_opening',
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-5 border-b border-slate-800/90">
        <div className="max-w-3xl">
          <p className="text-xs text-amber-400 font-semibold mb-1">
            {ui.chronicleKicker}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-balance">
            {ui.chronicleTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {ui.chronicleIntro}
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono text-slate-300 tabular-nums">
          <div>
            <p className="text-slate-400">{ui.forgeBestScoreLabel}</p>
            <p className="text-base font-bold text-amber-400">
              {progression.highScore.toLocaleString(language)} PTS
            </p>
          </div>
          <div>
            <p className="text-slate-400">{ui.chronicleMinionsSlainLabel}</p>
            <p className="text-base font-bold text-white">{progression.totalMinionsSlain}</p>
          </div>
        </div>
      </div>

      {/* Literary Prologue & Heroic Conclusion Narrative Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="bg-[#151921] border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>{ui.chroniclePrologueKicker}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {ui.chroniclePrologueTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {ui.chroniclePrologueBody}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={() => onPlayCutscene('act1_opening', 0)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Film className="w-3.5 h-3.5" />
              <span>{ui.chronicleWatchPrologueBtn}</span>
            </button>
          </div>
        </article>

        <article className="bg-[#151921] border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold">
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>{ui.chronicleConclusionKicker}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {ui.chronicleConclusionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {ui.chronicleConclusionBody}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={() => onPlayCutscene('campaign_ending', CAMPAIGN_ACTS.length - 1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-sky-100 bg-[#0C0E12] hover:bg-slate-800 border border-sky-700/70 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Film className="w-3.5 h-3.5 text-sky-400" />
              <span>{ui.chronicleWatchConclusionBtn}</span>
            </button>
          </div>
        </article>
      </div>

      {/* 6-Act Campaign Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CAMPAIGN_ACTS.map((act, index) => {
          const locAct = getLocalizedAct(index, language);
          const prevLocAct = index > 0 ? getLocalizedAct(index - 1, language) : locAct;
          const unlocked = index <= progression.currentAct || progression.completedCampaign;
          const completed =
            index < progression.currentAct || progression.completedCampaign;

          return (
            <article
              key={act.id}
              className="flex flex-col justify-between bg-[#151921] border border-slate-800/90 rounded-xl overflow-hidden"
            >
              <div>
                <ActVisualHeader act={act} actIndex={index} language={language} />
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400 tabular-nums">
                    <span>
                      {locAct.title} ·{' '}
                      {completed
                        ? ui.chronicleStatusCleared
                        : unlocked
                        ? ui.chronicleStatusUnlocked
                        : ui.chronicleStatusLocked}
                    </span>
                    <span>
                      +{act.rewardShards} {fg.shardWord} · +{act.rewardXp} XP
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {locAct.bossName} — {locAct.bossTitle}
                    </h3>
                    <p className="text-xs text-amber-300/90 mt-0.5">{locAct.zoneSubtitle}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {locAct.zoneStoryIntro}
                  </p>

                  {/* Pre-Arena Narrative & Taunt */}
                  <div className="pl-3.5 border-l-2 border-amber-500/40 space-y-1.5">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locAct.bossPreludeBody}
                    </p>
                    <p className="text-xs italic text-amber-200/90">
                      {locAct.bossTaunt}
                    </p>
                  </div>

                  {/* Regional Lesser Enemies (1 to 5 hits, clean unboxed rows) */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <p className="text-xs font-semibold text-slate-200">
                      {ui.chronicleMinionsSection}
                    </p>
                    <div className="space-y-1.5">
                      {act.zoneFeaturedMinions.map((skin) => {
                        const minion = MINION_ARCHETYPES[skin];
                        const locMinion = getLocalizedMinion(skin, language);
                        return (
                          <div
                            key={skin}
                            className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-slate-300 tabular-nums"
                          >
                            <span className="font-medium text-white">
                              {locMinion.name}{' '}
                              <span className="text-slate-400 font-normal">
                                · {locMinion.weaponLabel}
                              </span>
                            </span>
                            <span className="font-mono text-slate-300">
                              {minion.hp} {hpUnit} · {locMinion.hitsToKillLabel} ·{' '}
                              <span className="text-amber-300">+{minion.scoreValue} PTS</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Boss Tactics & Narrative Bridge */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                    <p>
                      <span className="text-slate-200 font-semibold">
                        {ui.chronicleBossTechLabel}
                      </span>{' '}
                      {locAct.bossSpecialLabel}
                    </p>
                    <p>
                      <span className="text-slate-200 font-semibold">
                        {ui.chronicleParryHintLabel}
                      </span>{' '}
                      {locAct.tacticalHint}
                    </p>
                    <p>
                      <span className="text-slate-200 font-semibold">
                        {ui.chronicleNextBridgeLabel}
                      </span>{' '}
                      {locAct.interludeTitle} — {locAct.interludeBody}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex flex-wrap items-center justify-end gap-2">
                {unlocked ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        onPlayCutscene(actOpeningCutscenes[index] ?? 'act1_opening', index)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-200 bg-[#0C0E12] hover:bg-slate-800 border border-amber-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5 text-amber-400" />
                      <span>{ui.chronicleCutsceneBtn}</span>
                    </button>
                    {index === CAMPAIGN_ACTS.length - 1 && (
                      <button
                        type="button"
                        onClick={() => onPlayCutscene('campaign_ending', index)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-200 bg-[#0C0E12] hover:bg-slate-800 border border-sky-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Film className="w-3.5 h-3.5 text-sky-400" />
                        <span>{ui.chronicleEpilogueBtn}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectActToPlay(index, 'boss_direct')}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-[#0C0E12] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {ui.chronicleBossDirectBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectActToPlay(index, 'full')}
                      className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {completed
                        ? ui.chronicleReplayBtn(locAct.bossName)
                        : ui.chroniclePlayBtn(locAct.bossName)}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800/70 text-slate-500 cursor-not-allowed whitespace-nowrap shrink-0"
                  >
                    {ui.chronicleLockedBtn(prevLocAct.bossName)}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
