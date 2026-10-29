import React, { useState } from 'react';
import { BookOpen, Flame, Shield, Swords } from 'lucide-react';
import { SWORD_TECHNIQUES } from '../data/campaign';
import type { ProgressionState, TechniqueId } from '../types/game';

interface CombatGuidePanelProps {
  progression: ProgressionState;
  onOpenAkaCodexScreen: () => void;
  onOpenAkaForgeScreen: () => void;
  onEquipTechnique: (id: TechniqueId) => void;
}

type GuideTab = 'attacks' | 'defense' | 'forge_techniques';

export const CombatGuidePanel: React.FC<CombatGuidePanelProps> = ({
  progression,
  onOpenAkaCodexScreen,
  onOpenAkaForgeScreen,
  onEquipTechnique,
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('attacks');

  const activeTech =
    SWORD_TECHNIQUES.find((t) => t.id === progression.equippedTechnique) ??
    SWORD_TECHNIQUES[0];

  return (
    <section className="bg-[#151921] border border-slate-800/90 rounded-xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-slate-800/90 bg-[#10141C]">
        <div>
          <p className="text-xs font-semibold text-amber-400">
            Manuel d’Armes Intégré · Botte active : {activeTech.name} ({activeTech.inputHint})
          </p>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Contrôles, Coups d’Épée, Parades & Forge de Bivouac
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenAkaCodexScreen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-200 bg-[#0C0E12] hover:bg-slate-800 border border-sky-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Afficher dans l’écran AKA (4 pages)</span>
          </button>
          <button
            type="button"
            onClick={onOpenAkaForgeScreen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Forge dans l’écran AKA ({progression.steelShards} Éclats)</span>
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
          <span>1. Coups Offensifs & Coup Fatal</span>
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
          <span>2. Garde, Parades, Esquives & Boss</span>
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
          <span>3. Quand utiliser la Forge & Bottes Secrètes</span>
        </button>
      </div>

      {/* Tab 1: Offensive Sword Moves */}
      {activeTab === 'attacks' && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#0C0E12] border border-slate-800/80 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-white text-sm">Taille Haute Vive</span>
              <span className="font-mono text-amber-300">Bouton A · Clavier F / Espace</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Frappe rapide à hauteur d’épaule (14 dégâts). Idéale pour interrompre un sbire ou punir une ouverture courte. Peut être esquivée si l’ennemi s’accroupit.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0C0E12] border border-slate-800/80 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-white text-sm">Fente d’Estoc</span>
              <span className="font-mono text-amber-300">Avant + A · Clavier D/Flèche + F</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Pas glissé vers l’avant suivi d’une pointe médiane à longue portée (16 dégâts). Touche même un adversaire accroupi, mais reste blocable en garde haute.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0C0E12] border border-slate-800/80 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-white text-sm">Balayage Bas Faucheur</span>
              <span className="font-mono text-amber-300">Bouton B (ou Bas + A) · Clavier G</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Fauche les chevilles sous la garde haute adverse et provoque une chute au sol ! Seul un saut (<code className="font-mono text-sky-300">Haut</code>) permet de l’éviter.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0C0E12] border border-slate-800/80 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-white text-sm">Fendoir Lourd Descendant</span>
              <span className="font-mono text-amber-300">Gâchette R1 (ou Haut + A) · Clavier T</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Coup vertical lourd à deux mains (23 dégâts, fort recul). Avec la Botte <strong>Fendoir Brise-Garde</strong> équipée, il fracasse net la garde haute adverse !
            </p>
          </div>

          <div className="md:col-span-2 p-3.5 rounded-lg bg-[#0C0E12] border border-amber-800/50 space-y-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-bold text-amber-300 text-sm">
                Moulinet Décapitant 360° (Coup Fatal Barbarian)
              </span>
              <span className="font-mono text-amber-300">
                Bouton C (ou Arrière + A) · Clavier R
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Rotation complète de lame à hauteur de nuque (frappe devant et derrière Krom dans les zones !). <strong>Décapite instantanément</strong> un Boss dont les PV passent sous le seuil fatal (35% de base, jusqu’à +34% supplémentaires avec la Forge et le <em>Moulinet du Loup</em>) ou dès que votre jauge de <strong>Rage dorée</strong> atteint son maximum.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Defense, Parries & Boss Counters */}
      {activeTab === 'defense' && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#0C0E12] border border-sky-900/60 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-sky-300 text-sm">
                Garde Haute & Parade Parfaite
              </span>
              <span className="font-mono text-sky-300">L1 · Clavier Maj / Q</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Maintenir <strong>L1</strong> bloque les tailles hautes, estocs et fendoirs (attention : ne bloque pas le Balayage Bas !). Presser <strong>L1 juste au moment de l’impact</strong> déclenche une <strong>Parade Parfaite</strong> qui étourdit l’assaillant, restaure votre Souffle et ouvre une contre-attaque gratuite.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0C0E12] border border-slate-800/80 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-white text-sm">Roulade Tactique Invincible</span>
              <span className="font-mono text-amber-300">Bouton D · Clavier E</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Krom plonge au sol pour passer dans le dos de l’adversaire ou reculer (<code className="font-mono text-sky-300">Arrière + D</code>). Traverse sans dégâts les coups hauts, les moulinets et les projectiles sombres !
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0C0E12] border border-slate-800/80 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-white text-sm">
                Esquive Accroupie & Saut d’Assaut
              </span>
              <span className="font-mono text-amber-300">Bas (S) · Haut (Z / W)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Bas</strong> : Krom met un genou à terre et laisse passer au-dessus de sa tête les Tailles Hautes et les tentatives de Décapitation ! <strong>Haut</strong> : saute par-dessus les Balayages Bas.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0C0E12] border border-slate-800/80 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-white text-sm">
                Contrer les Attaques Spéciales des Boss
              </span>
              <span className="font-mono text-amber-300">Actes II & IV</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Vorgath (Onde tellurique au sol)</strong> : sautez (<code className="font-mono text-sky-300">Haut</code>) par-dessus la flamme rampante. <strong>Seigneur Drax (Orbe d’améthyste)</strong> : roulez (<code className="font-mono text-sky-300">Bouton D</code>) à travers la sphère ou bloquez avec <code className="font-mono text-sky-300">L1</code>.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: When to use the Forge & Secret Techniques */}
      {activeTab === 'forge_techniques' && (
        <div className="p-5 space-y-4 text-xs">
          <div className="p-4 rounded-lg bg-[#0C0E12] border border-amber-700/40 space-y-1.5">
            <p className="font-bold text-amber-300 text-sm">
              Quand et comment utilise-t-on la Forge sur la console Gamebuino AKA ?
            </p>
            <p className="text-slate-300 leading-relaxed">
              En traversant les zones et en abattant des Boss, vous récoltez des <strong>Éclats d’Acier</strong>. Sur la console 320×240 non-tactile, la <strong>Forge de Bivouac</strong> s’ouvre automatiquement <strong>entre deux Actes</strong> après la victoire contre un Boss, et reste accessible à tout instant en appuyant sur le <strong>Bouton D (Clavier E)</strong> sur les écrans d’histoire (notamment juste avant d’entrer dans l’arène du Boss après une Zone !), sur l’écran de Défaite pour renforcer Krom avant une revanche, ou depuis le Menu Titre.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {SWORD_TECHNIQUES.map((tech) => {
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
                      <span className="font-bold text-white text-sm">{tech.name}</span>
                      <span className="font-mono text-amber-300">{tech.inputHint}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{tech.summary}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="font-mono text-slate-400 tabular-nums">
                      {equipped
                        ? 'Active dans le HUD 320×240'
                        : unlocked
                        ? 'Débloquée'
                        : `Forge : ${tech.unlockCost} Éclats`}
                    </span>
                    {unlocked && !equipped && (
                      <button
                        type="button"
                        onClick={() => onEquipTechnique(tech.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                      >
                        Équiper
                      </button>
                    )}
                    {!unlocked && (
                      <button
                        type="button"
                        onClick={onOpenAkaForgeScreen}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                      >
                        Débloquer à la Forge →
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
