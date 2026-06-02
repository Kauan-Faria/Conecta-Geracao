import { TopicSlug } from './topic-slug.vo';
import { InvalidTopicSlugError } from '../errors/domain.errors';

describe('TopicSlug', () => {
  it('should accept valid kebab-case slug', () => {
    const slug = TopicSlug.create('fazer-pix');
    expect(slug.value).toBe('fazer-pix');
  });

  it('should normalize uppercase to lowercase', () => {
    const slug = TopicSlug.create('Fazer-PIX');
    expect(slug.value).toBe('fazer-pix');
  });

  it('should reject invalid slug', () => {
    expect(() => TopicSlug.create('PIX inválido')).toThrow(InvalidTopicSlugError);
  });
});
