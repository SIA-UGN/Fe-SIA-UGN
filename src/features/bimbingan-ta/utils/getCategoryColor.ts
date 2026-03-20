export function getCategoryColor(categoryName: string): { bg: string; text: string } {
  const key = categoryName.trim();

  const map: Record<string, { bg: string; text: string }> = {
    'Artificial Intelligence': { bg: '#E6F4EA', text: '#015023' },
    'Software Engineering': { bg: '#E8F0FE', text: '#1D4ED8' },
    'Data Science': { bg: '#E0F7FA', text: '#0F766E' },
    'Cyber Security': { bg: '#ECFEFF', text: '#0E7490' },
    'Internet of Things': { bg: '#FEF3C7', text: '#92400E' },
  };

  return map[key] ?? { bg: '#F3F4F6', text: '#374151' };
}
