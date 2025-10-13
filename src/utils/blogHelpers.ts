export type BlogFocus = 'resource_review' | 'memento_mori_research' | 'meaningful_life';

// Format blog focus for display
export const formatBlogFocus = (focus: BlogFocus): string => {
  const map: Record<BlogFocus, string> = {
    resource_review: 'Resource Review',
    memento_mori_research: 'Memento Mori Research',
    meaningful_life: 'Meaningful Life'
  };
  return map[focus] || focus;
};

// Get blog focus color classes
export const getBlogFocusColor = (focus: BlogFocus): string => {
  const colors: Record<BlogFocus, string> = {
    resource_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    memento_mori_research: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    meaningful_life: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
  };
  return colors[focus] || 'bg-gray-100 text-gray-800';
};

// Extract images from markdown content
export const extractImagesFromMarkdown = (markdown: string): string[] => {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

// Get blog focus icon name
export const getBlogFocusIcon = (focus: BlogFocus): string => {
  const icons: Record<BlogFocus, string> = {
    resource_review: 'Book',
    memento_mori_research: 'Brain',
    meaningful_life: 'Heart'
  };
  return icons[focus] || 'FileText';
};
