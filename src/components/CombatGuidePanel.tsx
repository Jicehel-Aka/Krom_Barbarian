import React, { useState } from 'react';
import { BookOpen, Flame, Shield, Swords } from 'lucide-react';
import { SWORD_TECHNIQUES } from '../data/campaign';
import { getLocalizedForge, getLocalizedWebUi } from '../i18n/gameContentLocale';
import type { LanguageCode, ProgressionState, TechniqueId } from '../types/game';

interface CombatGuidePanelProps {
  progression: ProgressionState;
  language: LanguageCode;
  onOpenAkaCodexScreen: () => void;
  onOpenAkaForgeScreen: () => void;
  onEquipTechnique: (id: TechniqueId) => void;
}

type GuideTab = 'attacks' | 'defense' | 'forge_techniques';

export const CombatGuidePanel: React.FC<CombatGuidePanelProps> = ({
  progression,
  language,
  onOpenAkaCodexScreen,
  onOpenAkaForgeScreen,
  onEquipTechnique,
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('attacks');
  const ui = getLocalizedWebUi(language);
  const fg = getLocalizedForge(language);

  const activeTech =
    SWORD_TECHNIQUES.find((t) => t.id === progression.equippedTechnique) ??
    SWORD_TECHNIQUES[0];
  const locActiveTech = fg.techniques[activeTech.id];

  return (
    <section className="bg-[#151921] border border-slate-800/90 rounded-xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-slate-800/90 bg-[#10141C]">
        <div>
          <p className="text-xs font-semibold text-amber-400">
            {ui.guideKicker(locActiveTech.name, locActiveTech.inputHint)}
          </p>
          <h3 className="text-base sm:text-lg font-bold text-white">
            {ui.guideTitle}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAkaCodexScreen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-200 bg-[#0C0E12] hover:bg-slate-800 border border-sky-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>{ui.guideBtnAkaCodex}</span>
          </button>
          <button
            type="button"
            onClick={onOpenAkaForgeScreen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{ui.guideBtnAkaForge(progression.steelShards)}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-6 px-5 py-3 border-b border-slate-800/80 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('attacks')}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'attacks'
              ? 'text-amber-400 underline underline-offset-8 decoration-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>{ui.guideTab1}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('defense')}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'defense'
              ? 'text-amber-400 underline underline-offset-8 decoration-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{ui.guideTab2}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('forge_techniques')}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'forge_techniques'
              ? 'text-amber-400 underline underline-offset-8 decoration-amber-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{ui.guideTab3}</span>
        </button>
      </div>

      {/* Tab 1: Offensive Sword Moves */}
      {activeTab === 'attacks' && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {ui.guideMoves.map((mv, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-[#0C0E12] border border-slate-800/80 space-y-1"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-bold text-white text-sm">{mv.title}</span>
                <span className="font-mono text-amber-300">{mv.input}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{mv.body}</p>
            </div>
          ))}

          <div className="md:col-span-2 p-3.5 rounded-lg bg-[#0C0E12] border border-amber-800/50 space-y-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-bold text-amber-300 text-sm">
                {ui.guideFatalMove.title}
              </span>
              <span className="font-mono text-amber-300">
                {ui.guideFatalMove.input}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">{ui.guideFatalMove.body}</p>
          </div>
        </div>
      )}

      {/* Tab 2: Defense, Parries & Boss Counters */}
      {activeTab === 'defense' && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {ui.guideDefenseCards.map((dc, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg bg-[#0C0E12] border space-y-1 ${
                idx === 0 ? 'border-sky-900/60' : 'border-slate-800/80'
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span
                  className={`font-bold text-sm ${
                    idx === 0 ? 'text-sky-300' : 'text-white'
                  }`}
                >
                  {dc.title}
                </span>
                <span
                  className={`font-mono ${
                    idx === 0 ? 'text-sky-300' : 'text-amber-300'
                  }`}
                >
                  {dc.input}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">{dc.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: When to use the Forge & Secret Techniques */}
      {activeTab === 'forge_techniques' && (
        <div className="p-5 space-y-4 text-xs">
          <div className="p-4 rounded-lg bg-[#0C0E12] border border-amber-700/40 space-y-1.5">
            <p className="font-bold text-amber-300 text-sm">{ui.guideForgeWhenTitle}</p>
            <p className="text-slate-300 leading-relaxed">{ui.guideForgeWhenBody}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {SWORD_TECHNIQUES.map((tech) => {
              const locTech = fg.techniques[tech.id];
              const unlocked = progression.unlockedTechniques.includes(tech.id);
              const equipped = progression.equippedTechnique === tech.id;
              return (
                <div
                  key={tech.id}
                  className={`p-3.5 rounded-lg bg-[#0C0E12] border flex flex-col justify-between gap-3 ${
                    equipped ? 'border-amber-500/80' : 'border-slate-800/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-white text-sm">{locTech.name}</span>
                      <span className="font-mono text-amber-300">{locTech.inputHint}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{locTech.summary}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="font-mono text-slate-400 tabular-nums">
                      {equipped
                        ? ui.guideActiveHudTag
                        : unlocked
                        ? ui.guideUnlockedTag
                        : ui.guideCostTag(tech.unlockCost)}
                    </span>
                    {unlocked && !equipped && (
                      <button
                        type="button"
                        onClick={() => onEquipTechnique(tech.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {ui.guideEquipBtn}
                      </button>
                    )}
                    {!unlocked && (
                      <button
                        type="button"
                        onClick={onOpenAkaForgeScreen}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {ui.guideUnlockInForgeBtn}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
