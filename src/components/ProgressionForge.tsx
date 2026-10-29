import React from 'react';
import { FORGE_UPGRADES, SWORD_TECHNIQUES, type UpgradeSpec } from '../data/campaign';
import type { ProgressionState, TechniqueId } from '../types/game';

interface ProgressionForgeProps {
  progression: ProgressionState;
  onPurchaseUpgrade: (key: UpgradeSpec['key'], cost: number) => void;
  onUnlockTechnique: (id: TechniqueId, cost: number) => void;
  onEquipTechnique: (id: TechniqueId) => void;
  onResetProgression: () => void;
  onReturnToArena: () => void;
}

export const ProgressionForge: React.FC<ProgressionForgeProps> = ({
  progression,
  onPurchaseUpgrade,
  onUnlockTechnique,
  onEquipTechnique,
  onResetProgression,
  onReturnToArena,
}) => {
  const maxRank = 4;

  return (
    <section className="space-y-10">
      {/* Header & Player Resources */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-slate-800/90">
        <div className="max-w-2xl">
          <p className="text-xs text-amber-400 font-semibold mb-1">
            Progression de Krom · Sauvegarde Locale Automatique
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-balance">
            La Forge des Hautes-Brumes
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Dépensez vos Éclats d’Acier récoltés sur les sbires des zones et les Seigneurs de Guerre. Vos améliorations et votre <strong>Botte Secrète</strong> s’appliquent immédiatement à Krom (visibles en haut à gauche du HUD 320×240). Sur la console Gamebuino AKA, cette Forge s’ouvre automatiquement au bivouac entre deux Actes ou via le <strong>Bouton D (touche E)</strong> avant chaque Boss et après une défaite.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm tabular-nums">
          <div>
            <p className="text-xs text-slate-400">Éclats d’Acier</p>
            <p className="text-2xl font-bold font-mono text-amber-400">
              {progression.steelShards}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Meilleur Score</p>
            <p className="text-lg font-bold font-mono text-white">
              {progression.highScore.toLocaleString('fr-FR')} PTS
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Tableau de Chasse</p>
            <p className="text-sm font-semibold font-mono text-slate-200">
              {progression.totalMinionsSlain} Sbires · {progression.totalWins} Boss ·{' '}
              {progression.totalDecapitations} Décap.
            </p>
          </div>
          <button
            type="button"
            onClick={onReturnToArena}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Retourner au Combat
          </button>
        </div>
      </div>

      {/* Stat Upgrades Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">
          01. Attributs du Guerrier & Trempe de l’Acier
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FORGE_UPGRADES.map((up) => {
            const currentRank = progression[up.key];
            const isMax = currentRank >= maxRank;
            const nextCost = up.baseCost + currentRank * up.costStep;
            const canAfford = !isMax && progression.steelShards >= nextCost;

            return (
              <div
                key={up.key}
                className="flex flex-col justify-between p-5 bg-[#151921] border border-slate-800/90 rounded-xl gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400 tabular-nums">
                    <span>
                      {up.unitLabel} · Rang {currentRank}/{maxRank}
                    </span>
                    <span className="font-mono text-amber-300">
                      {up.formatEffect(currentRank)}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{up.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {up.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: maxRank }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-6 h-1.5 rounded-sm ${
                          idx < currentRank ? 'bg-amber-500' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => onPurchaseUpgrade(up.key, nextCost)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                      isMax
                        ? 'bg-slate-800/60 text-slate-400 cursor-default'
                        : canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isMax ? 'Maîtrise Maximale' : `Forger (${nextCost} Éclats)`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Master Sword Techniques */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">
          02. Bottes Secrètes & Style d’Escrime
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {SWORD_TECHNIQUES.map((tech) => {
            const isUnlocked = progression.unlockedTechniques.includes(tech.id);
            const isEquipped = progression.equippedTechnique === tech.id;
            const canBuy = !isUnlocked && progression.steelShards >= tech.unlockCost;

            return (
              <div
                key={tech.id}
                className={`flex flex-col justify-between p-5 bg-[#151921] border rounded-xl gap-4 ${
                  isEquipped ? 'border-amber-500/80' : 'border-slate-800/90'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-amber-400">Commande : {tech.inputHint}</span>
                    {isEquipped && (
                      <span className="text-emerald-400 font-semibold">★ ÉQUIPÉE</span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white">{tech.name}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {tech.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400 tabular-nums">
                    {isEquipped
                      ? 'Style actif en combat'
                      : isUnlocked
                      ? 'Débloqué'
                      : `Coût : ${tech.unlockCost} Éclats`}
                  </span>

                  {isUnlocked ? (
                    <button
                      type="button"
                      disabled={isEquipped}
                      onClick={() => onEquipTechnique(tech.id)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        isEquipped
                          ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                      }`}
                    >
                      {isEquipped ? 'Équipée' : 'Équiper'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canBuy}
                      onClick={() => onUnlockTechnique(tech.id, tech.unlockCost)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                        canBuy
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Apprendre ({tech.unlockCost} Éclats)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiet Reset Action */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4 text-xs text-slate-400">
        <span>
          Votre progression, votre meilleur score et vos Éclats d’Acier sont enregistrés automatiquement sur cet appareil.
        </span>
        <button
          type="button"
          onClick={onResetProgression}
          className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Réinitialiser la sauvegarde
        </button>
      </div>
    </section>
  );
};
