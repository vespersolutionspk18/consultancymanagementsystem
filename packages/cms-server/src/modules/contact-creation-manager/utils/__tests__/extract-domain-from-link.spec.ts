import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';

describe('extractDomainFromLink', () => {
  it('should extract domain from link', () => {
    const link = 'https://www.cms.com';
    const result = extractDomainFromLink(link);

    expect(result).toBe('cms.com');
  });

  it('should extract domain from link without www', () => {
    const link = 'https://cms.com';
    const result = extractDomainFromLink(link);

    expect(result).toBe('cms.com');
  });

  it('should extract domain from link without protocol', () => {
    const link = 'cms.com';
    const result = extractDomainFromLink(link);

    expect(result).toBe('cms.com');
  });

  it('should extract domain from link with path', () => {
    const link = 'https://cms.com/about';
    const result = extractDomainFromLink(link);

    expect(result).toBe('cms.com');
  });
});
