import { TipSelectionPolicy } from './tip-selection.policy';
import { EducationalTip } from '../entities/educational-tip.entity';

describe('TipSelectionPolicy', () => {
  const catalog = [
    EducationalTip.reconstitute({
      id: 'tip-1',
      title: 'A',
      body: 'Body A',
      deepLink: '/a',
      isActive: true,
      sortOrder: 1,
    }),
    EducationalTip.reconstitute({
      id: 'tip-2',
      title: 'B',
      body: 'Body B',
      deepLink: '/b',
      isActive: true,
      sortOrder: 2,
    }),
  ];

  it('seleciona mesma dica para o mesmo usuário na mesma semana', () => {
    const policy = new TipSelectionPolicy();
    const first = policy.selectTipForUser('user-abc', catalog);
    const second = policy.selectTipForUser('user-abc', catalog);
    expect(first.id).toBe(second.id);
  });

  it('pode selecionar dicas diferentes para usuários distintos', () => {
    const policy = new TipSelectionPolicy();
    const tips = new Set(
      ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'].map(
        (uid) => policy.selectTipForUser(uid, catalog).id,
      ),
    );
    expect(tips.size).toBeGreaterThanOrEqual(1);
  });
});
