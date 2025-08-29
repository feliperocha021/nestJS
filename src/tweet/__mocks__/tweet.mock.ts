import { Paginated } from 'src/common/pagination/pagination.interface';
import { HashtagResponseDto } from 'src/hashtag/dto/hashtag-response.dto';
import { USER_ID } from 'src/profile/__mocks__/profile.mock';

// ====================
// IDs base
// ====================
export const TWEET_ID = [1, 2];
export const INVALID_TWEET_ID = 999;

// ====================
// Hashtags no formato DTO
// ====================
export const rawHashtag: HashtagResponseDto = {
  id: 101,
  name: '#nestjs',
};

export const rawHashtag2: HashtagResponseDto = {
  id: 102,
  name: '#typescript',
};

// ====================
// ---- FORMATO CRU DE ENTIDADE (Service) ----
// ====================

export const rawTweetEntity = {
  id: TWEET_ID[0],
  text: 'Meu primeiro tweet de teste',
  image: 'https://example.com/image.png',
  createdAt: new Date('2025-08-08T16:00:30.480Z'),
  updatedAt: new Date('2025-08-08T16:00:30.480Z'),
  user: {
    id: USER_ID[0],
    username: 'mark',
    email: 'mark@example.com',
    password: 'senhaHash',
    createdAt: new Date('2025-08-07T16:00:30.480Z'),
    updatedAt: new Date('2025-08-07T16:00:30.480Z'),
    deletedAt: null,
    profile: undefined,
    tweets: undefined,
  },
  hashtags: [
    {
      id: rawHashtag.id,
      name: rawHashtag.name,
      deletedAt: null,
      tweets: undefined,
    },
    {
      id: rawHashtag2.id,
      name: rawHashtag2.name,
      deletedAt: null,
      tweets: undefined,
    },
  ],
};

export const rawTweetEntityNoHashtags = {
  ...rawTweetEntity,
  hashtags: [],
};

// Usado em create/update que retorna entidade salva
export const savedTweetEntity = {
  id: TWEET_ID[1],
  text: 'Meu segundo tweet',
  image: undefined,
  createdAt: new Date('2025-08-09T16:00:30.480Z'),
  updatedAt: new Date('2025-08-09T16:00:30.480Z'),
  user: {
    id: USER_ID[1],
    username: 'alice',
    email: 'alice@example.com',
    password: 'senhaHash',
    createdAt: new Date('2025-08-08T16:00:30.480Z'),
    updatedAt: new Date('2025-08-08T16:00:30.480Z'),
    deletedAt: null,
    profile: undefined,
    tweets: undefined,
  },
  hashtags: [
    {
      id: rawHashtag.id,
      name: rawHashtag.name,
      deletedAt: null,
      tweets: undefined,
    },
    {
      id: rawHashtag2.id,
      name: rawHashtag2.name,
      deletedAt: null,
      tweets: undefined,
    },
  ],
};

// ====================
// ---- FORMATO DTO (Controller) ----
// ====================

export const rawTweetDto = {
  id: TWEET_ID[0],
  text: 'Meu primeiro tweet de teste',
  image: 'https://example.com/image.png',
  createdAt: new Date('2025-08-08T16:00:30.480Z'),
  updatedAt: new Date('2025-08-08T16:00:30.480Z'),
  user: {
    id: USER_ID[0],
    username: 'mark',
  },
  hashtags: [rawHashtag, rawHashtag2],
};

export const rawTweetDtoNoHashtags = {
  ...rawTweetDto,
  hashtags: [],
};

export const savedTweetDto = {
  id: TWEET_ID[1],
  text: 'Meu segundo tweet',
  image: undefined,
  createdAt: new Date('2025-08-09T16:00:30.480Z'),
  updatedAt: new Date('2025-08-09T16:00:30.480Z'),
  user: {
    id: USER_ID[1],
    username: 'alice',
  },
  hashtags: [rawHashtag, rawHashtag2],
};

// ====================
// ---- DTOs de entrada (argumentos para Service) ----
// ====================

export const createTweetDto = {
  text: 'Meu segundo tweet',
  image: undefined,
  hashtags: [rawHashtag.id, rawHashtag2.id],
};

export const updateTweetDto = {
  text: 'Tweet atualizado',
  image: 'https://example.com/updated.png',
  hashtags: [rawHashtag.id],
};

// ====================
// ---- Paginação fake ----
// ====================

// Para testes do Service (com formato cru de entidade)
export const fakePaginatedTweetsEntity: Paginated<typeof rawTweetEntity> = {
  data: [rawTweetEntity],
  meta: {
    itemsPerPage: 1,
    totalItems: 2,
    currentPage: 1,
    totalPages: 2,
  },
};

// Para testes do Controller (com formato DTO)
export const fakePaginatedTweetsDto: Paginated<typeof rawTweetDto> = {
  data: [rawTweetDto],
  meta: {
    itemsPerPage: 1,
    totalItems: 2,
    currentPage: 1,
    totalPages: 2,
  },
  links: {
    first: 'http://localhost:3000/tweets?limit=1&page=1',
    last: 'http://localhost:3000/tweets?limit=1&page=2',
    current: 'http://localhost:3000/tweets?limit=1&page=1',
    next: 'http://localhost:3000/tweets?limit=1&page=2',
    previous: 'http://localhost:3000/tweets?limit=1&page=1',
  },
};
