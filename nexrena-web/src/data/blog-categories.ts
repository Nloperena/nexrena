export interface BlogCategory {
  id: string;
  name: string;
  description: string;
}

export const blogCategories: BlogCategory[] = [
  { id: 'seo', name: 'SEO', description: 'Technical SEO, content strategy, and search growth for B2B companies.' },
  { id: 'web-design', name: 'Web Design', description: 'B2B web design, development, UX, and conversion architecture.' },
  { id: 'ecommerce', name: 'E-Commerce', description: 'Headless commerce, checkout optimization, and category page strategy.' },
  { id: 'strategy', name: 'Strategy', description: 'Digital growth strategy, agency partnerships, and measurement frameworks.' },
  { id: 'manufacturing', name: 'Manufacturing', description: 'Digital growth insights for manufacturers and industrial companies.' },
  { id: 'professional-services', name: 'Professional Services', description: 'Web presence and lead generation for law firms, consultants, and accounting firms.' },
];
