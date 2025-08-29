// Export all services for easy importing
export { BaseDataService } from './base-data.service';
export { PostsService } from './posts.service';
export { CategoriesService } from './categories.service';
export { AuthorsService } from './authors.service';
export { CommentsService } from './comments.service';
export { TagsService } from './tags.service';
export { ContactService } from './contact.service';

// Export DTOs and interfaces
export type { ApiResponse } from './base-data.service';
export type { 
  CreatePostDto, 
  UpdatePostDto, 
  PostFilters 
} from './posts.service';
export type { 
  CreateCategoryDto, 
  UpdateCategoryDto 
} from './categories.service';
export type { 
  CreateAuthorDto, 
  UpdateAuthorDto 
} from './authors.service';
export type { 
  CreateCommentDto, 
  UpdateCommentDto, 
  CommentFilters 
} from './comments.service';
export type { 
  CreateTagDto, 
  UpdateTagDto 
} from './tags.service';
export type { 
  ContactSubmission,
  CreateContactDto 
} from './contact.service';